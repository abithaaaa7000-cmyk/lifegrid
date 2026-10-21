import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import * as authApi from '../api/auth'
import * as familiesApi from '../api/families'
import * as cascadeApi from '../api/cascade'
import * as interventionsApi from '../api/interventions'
import { getToken, setToken } from '../api/client'

const AppContext = createContext(null)

function userToOfficer(user) {
  if (!user) return null
  return { name: user.name, role: user.role, employeeId: user.employeeId || '', email: user.email }
}

export function AppProvider({ children }) {
  // --- Auth --------------------------------------------------------------
  // Backed by POST /api/auth/login, POST /api/auth/register, GET /api/auth/me.
  // A JWT is stored in localStorage and restored on load so a refresh
  // doesn't sign the officer out.
  const [officer, setOfficer] = useState(null) // { name, role, employeeId, email } | null
  const [authLoading, setAuthLoading] = useState(true) // true while restoring a session on first load

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setAuthLoading(false)
      return
    }
    authApi
      .getMeRequest()
      .then(({ user }) => setOfficer(userToOfficer(user)))
      .catch(() => setToken(null)) // stale/expired token
      .finally(() => setAuthLoading(false))
  }, [])

  async function login(email, password) {
    const { token, user } = await authApi.loginRequest({ email, password })
    setToken(token)
    setOfficer(userToOfficer(user))
    return user
  }

  async function register({ name, email, password, role, employeeId }) {
    const { token, user } = await authApi.registerRequest({ name, email, password, role, employeeId })
    setToken(token)
    setOfficer(userToOfficer(user))
    return user
  }

  function logout() {
    setToken(null)
    setOfficer(null)
    setFamilies([])
    setSelectedFamilyId(null)
    setSelectedShockId(null)
    setSelectedInterventionIds([])
    setApprovalStatus('pending')
    setCascade(null)
    setRankedInterventions([])
    setShockCatalog([])
  }

  // --- Families / Vulnerability -------------------------------------------
  // Backed by /api/families — every family returned by the API already
  // carries a fully-scored `vulnerability` object (score, band, tier w/
  // tone+action+description, factor breakdown, support relief) computed by
  // backend/utils/scoringEngine.js. The frontend no longer scores anything
  // itself — it just renders what the API returns.
  const [families, setFamilies] = useState([])
  const [familiesLoading, setFamiliesLoading] = useState(false)
  const [familiesError, setFamiliesError] = useState('')

  const [selectedFamilyId, setSelectedFamilyId] = useState(null)
  const [selectedShockId, setSelectedShockId] = useState(null)
  const [selectedInterventionIds, setSelectedInterventionIds] = useState([])
  const [budget, setBudget] = useState(15000)
  const [approvalStatus, setApprovalStatus] = useState('pending') // pending | approved | rejected

  // --- Shock catalog -------------------------------------------------------
  // GET /api/cascade/shocks — reference data for the "Select Shock" grid.
  // Was previously imported straight from mockData.js.
  const [shockCatalog, setShockCatalog] = useState([])

  useEffect(() => {
    if (!officer) return
    cascadeApi
      .getShockCatalog()
      .then(({ shocks }) => setShockCatalog(shocks))
      .catch(() => setShockCatalog([]))
  }, [officer])

  const refreshFamilies = useCallback(async () => {
    setFamiliesLoading(true)
    setFamiliesError('')
    try {
      const { families: list } = await familiesApi.listFamilies()
      setFamilies(list)
      setSelectedFamilyId((prev) => (prev && list.some((f) => f.id === prev) ? prev : list[0]?.id ?? null))
    } catch (err) {
      setFamiliesError(err.message || 'Could not load households.')
    } finally {
      setFamiliesLoading(false)
    }
  }, [])

  // Load the household registry once an officer is signed in; clear it on logout.
  useEffect(() => {
    if (officer) refreshFamilies()
  }, [officer, refreshFamilies])

  const selectedFamily = useMemo(
    () => families.find((f) => f.id === selectedFamilyId) ?? null,
    [families, selectedFamilyId],
  )

  // Straight from the API response — see toFamilyResponse() in
  // backend/controllers/familyController.js.
  const vulnerability = selectedFamily?.vulnerability ?? null

  // --- Shock Cascade (Module 8) --------------------------------------------
  // Every simulation is now a real, persisted POST /api/cascade call instead
  // of a client-side buildCascade() mock recomputed on every render — see
  // backend/controllers/cascadeController.js.
  const [cascade, setCascade] = useState(null) // includes `.id` once persisted
  const [cascadeLoading, setCascadeLoading] = useState(false)
  const [cascadeError, setCascadeError] = useState('')

  useEffect(() => {
    if (!selectedShockId || !selectedFamily) {
      setCascade(null)
      return
    }
    let cancelled = false
    setCascadeLoading(true)
    setCascadeError('')
    cascadeApi
      .runCascadeRequest({ familyId: selectedFamily.id, shockId: selectedShockId })
      .then(({ cascade: run }) => {
        if (!cancelled) setCascade(run)
      })
      .catch((err) => {
        if (!cancelled) {
          setCascade(null)
          setCascadeError(err.message || 'Could not run shock simulation.')
        }
      })
      .finally(() => {
        if (!cancelled) setCascadeLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedShockId, selectedFamily])

  // --- Intervention Optimization (Module 9) --------------------------------
  // Ranking now runs server-side (POST /api/interventions/rank) against the
  // persisted cascade run + the DB-backed intervention catalog, replacing
  // the frontend's rankInterventions() mock over a hardcoded array.
  const [rankedInterventions, setRankedInterventions] = useState([])
  const [interventionsLoading, setInterventionsLoading] = useState(false)
  const [interventionsError, setInterventionsError] = useState('')

  useEffect(() => {
    if (!cascade?.id) {
      setRankedInterventions([])
      return
    }
    let cancelled = false
    setInterventionsLoading(true)
    setInterventionsError('')
    interventionsApi
      .rankInterventionsRequest({ cascadeId: cascade.id, budget })
      .then(({ ranked }) => {
        if (!cancelled) setRankedInterventions(ranked)
      })
      .catch((err) => {
        if (!cancelled) {
          setRankedInterventions([])
          setInterventionsError(err.message || 'Could not rank interventions.')
        }
      })
      .finally(() => {
        if (!cancelled) setInterventionsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [cascade?.id, budget])

  async function addFamily(familyPayload) {
    const { family } = await familiesApi.createFamilyRequest(familyPayload)
    setFamilies((prev) => [family, ...prev])
    setSelectedFamilyId(family.id)
    return family.id
  }

  async function updateFamily(id, patch) {
    const { family } = await familiesApi.updateFamilyRequest(id, patch)
    setFamilies((prev) => prev.map((f) => (f.id === id ? family : f)))
    return family
  }

  function toggleIntervention(intervention) {
    setSelectedInterventionIds((prev) =>
      prev.includes(intervention.id) ? prev.filter((id) => id !== intervention.id) : [...prev, intervention.id],
    )
    // Any change to the plan re-opens it for human review.
    setApprovalStatus('pending')
  }

  function selectFamily(id) {
    setSelectedFamilyId(id)
    setSelectedShockId(null)
    setSelectedInterventionIds([])
    setApprovalStatus('pending')
  }

  const value = {
    officer,
    isAuthenticated: !!officer,
    isAdmin: officer?.role === 'admin',
    isFieldWorker: officer?.role === 'field-worker',
    authLoading,
    login,
    register,
    logout,
    families,
    familiesLoading,
    familiesError,
    refreshFamilies,
    addFamily,
    updateFamily,
    selectedFamily,
    selectedFamilyId,
    setSelectedFamilyId,
    selectFamily,
    vulnerability,
    shockCatalog,
    selectedShockId,
    setSelectedShockId,
    cascade,
    cascadeLoading,
    cascadeError,
    rankedInterventions,
    interventionsLoading,
    interventionsError,
    budget,
    setBudget,
    selectedInterventionIds,
    toggleIntervention,
    setSelectedInterventionIds,
    approvalStatus,
    setApprovalStatus,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
