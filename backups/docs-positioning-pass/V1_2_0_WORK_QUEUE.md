# v1.2.0-alpha Work Queue

## Purpose

This document breaks the v1.2.0-alpha execution plan into practical implementation work items.

**Source of truth:** [V1_2_0_EXECUTION_PLAN.md](V1_2_0_EXECUTION_PLAN.md)

The work queue is focused on local-first planning, workflow tracking, EHR calculation clarity, and weekly review improvements.

This work does not add credential collection, payment processing, hidden account access, or automated platform actions.

---

## Recommended Build Order

| Order | Deliverable | Rationale |
|-------|-------------|-----------|
| 1 | **D3: EHR Calculation Refinement** | Foundation for accurate reporting |
| 2 | **D1: Lever History Tracking** | Required by D5, provides data for weekly review |
| 3 | **D2: Mission Completion Tracking** | Independent, improves daily execution loop |
| 4 | **D4: ZCcode Spec Files** | Documentation/specification work, no code dependencies |
| 5 | **D5: Weekly Review Improvements** | Depends on D1 and D3 |

---

## Maximum Leverage First

Start with **D3: EHR Calculation Refinement**.

Rationale:

- EHR is the core measurement signal of the system
- Edge case bugs reduce user trust
- Clear calculations make reports more reliable
- No dependencies are required
- Small scope, high practical impact

---

## Work Items

### W1: EHR Calculation Refinement

**Deliverable:** D3  
**Purpose:** Eliminate edge case errors in EHR calculation and provide clearer distinctions between lever-specific and total EHR.

**Scope:**

- Fix division-by-zero handling when no hours are logged
- Handle zero-revenue weeks clearly
- Separate lever EHR, using `LEVER` category hours only, from total EHR, using all logged hours
- Document calculation methodology in code comments

**Acceptance criteria:**

- [ ] Zero-hour weeks display “No hours logged” instead of `$0/h` or `NaN`
- [ ] Zero-revenue weeks display “No revenue recorded”
- [ ] Lever EHR calculation excludes non-LEVER category hours
- [ ] Total EHR calculation includes all logged hours
- [ ] Calculation logic is documented in `src/lib/metrics.ts` comments
- [ ] UI does not imply guaranteed or predicted income

**Dependencies:** None

**Implementation notes:**

- Primary file: `src/lib/metrics.ts`
- Check `calcEhr` function for division handling
- Check `weeklyHours` function for category filtering
- Update report components to use the correct EHR variant
- Add JSDoc comments explaining formulas

**Estimated scope:** Small, likely 1–2 files

---

### W2: Lever History Tracking

**Deliverable:** D1  
**Purpose:** Persist lever selections over time to support clearer weekly review and future recommendations.

**Scope:**

- Store lever selection with week metadata
- Capture EHR at selection time and week end
- Display history in weekly report
- Include lever history in data export where applicable

**Acceptance criteria:**

- [ ] `WeeklyPlan` or new model stores `lever`, `weekStart`, `ehrAtSelection`, and `ehrAtEnd`
- [ ] Selection timestamp is recorded when lever is set
- [ ] Weekly report shows last 4 weeks of lever history
- [ ] Data export includes lever history
- [ ] Migration does not break existing data

**Dependencies:** None, but benefits from W1 being complete first

**Implementation notes:**

- Option A: Add fields to existing `WeeklyPlan` model
- Option B: Create separate `LeverHistory` model with relation
- Update `src/app/rpc/lever-override/route.ts` to record history
- Update weekly report component to fetch and display history
- Update data export to include new fields
- Create Prisma migration

**Estimated scope:** Medium

---

### W3: Mission Completion Tracking

**Deliverable:** D2  
**Purpose:** Allow users to mark daily missions complete and track completion rate.

**Scope:**

- Add completion timestamp to mission model
- Add UI control to mark mission complete
- Show completion rate in weekly report

**Acceptance criteria:**

- [ ] `DailyMission` model has `completedAt: DateTime?` field
- [ ] Dashboard shows “Mark Complete” button when a mission is active
- [ ] Clicking the button sets `completedAt` to the current timestamp
- [ ] Button changes to “Completed” state after marking
- [ ] Weekly report shows “X/7 missions completed”
- [ ] Completion state is scoped to the correct mission/day

**Dependencies:** None

**Implementation notes:**

- Add field to `DailyMission` in `prisma/schema.prisma`
- Create migration
- Add API endpoint or modify existing `/rpc/mission` for completion
- Update dashboard component with completion UI
- Update weekly report to calculate completion rate
- Decide whether completion should be reversible

**Estimated scope:** Medium

---

### W4: ZCcode Spec Files

**Deliverable:** D4  
**Purpose:** Create structured specification files for core system components using ZCcode format.

ZCcode is used as a communication and specification format. It is not executable runtime code.

**Scope:**

- Create `zccode/` directory
- Write spec for mission generation
- Write spec for strategy selection
- Write spec for EHR calculation
- Update ZCcode language documentation

**Acceptance criteria:**

- [ ] `zccode/mission.zc` exists with mission generation interface
- [ ] `zccode/strategy.zc` exists with strategy selection interface
- [ ] `zccode/ehr.zc` exists with EHR calculation interface
- [ ] Files follow documented ZCcode format
- [ ] `docs/ZCCODE_LANGUAGE.md` is updated with spec file examples
- [ ] Specs are clearly labelled as descriptive, not executable

**Dependencies:** None

**Implementation notes:**

- Review `docs/ZCCODE_LANGUAGE.md` for format reference
- Extract interface from `src/lib/ai.ts` for mission and strategy specs
- Extract interface from `src/lib/metrics.ts` for EHR spec
- Keep specs descriptive, not executable
- Prefer clarity over clever syntax

**Estimated scope:** Small, documentation/specification focused

---

### W5: Weekly Review Improvements

**Deliverable:** D5  
**Purpose:** Enhance weekly review with practical insights based on historical data.

**Scope:**

- Add week-over-week EHR comparison
- Add execution consistency score
- Add suggested next lever based on user history and simple rules
- Update PDF export with new fields where applicable

**Acceptance criteria:**

- [ ] Weekly review shows EHR comparison against the previous week
- [ ] Execution consistency shows percentage of target hours logged
- [ ] Suggested lever is shown as decision support, not a command
- [ ] PDF export includes all new fields where applicable
- [ ] Insufficient-history cases are handled clearly
- [ ] Recommendations do not imply guaranteed financial outcomes

**Dependencies:**

- W1: EHR Calculation Refinement
- W2: Lever History Tracking

**Implementation notes:**

- Update `/rpc/reports/weekly` to include comparison data
- Calculate consistency as `(actual hours / target hours) * 100`
- Suggested lever logic should be explainable and user-reviewable
- Update `src/app/(app)/reports/weekly/page.tsx` component
- Update PDF generation in weekly review route if applicable
- Handle edge cases: first week, no comparison, no target set

**Estimated scope:** Medium to large

---

## Progress Tracking

| Work Item | Status | Started | Completed | Notes |
|-----------|--------|---------|-----------|-------|
| W1: EHR Refinement | Not Started | - | - | Start here |
| W2: Lever History | Not Started | - | - | After W1 |
| W3: Mission Completion | Not Started | - | - | Independent |
| W4: ZCcode Specs | Not Started | - | - | Independent |
| W5: Weekly Review | Not Started | - | - | After W1 and W2 |

---

## Definition of Done

Each work item is complete when:

1. Code changes are implemented
2. Tests pass
3. `npm run lint` passes
4. `npm run build` passes
5. Manual verification confirms the feature works
6. Documentation is updated if user-facing behavior changes
7. CHANGELOG is updated if required
8. PR is reviewed and merged to main
