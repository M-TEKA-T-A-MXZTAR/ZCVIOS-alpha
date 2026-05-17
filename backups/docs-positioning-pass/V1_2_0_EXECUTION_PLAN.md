# v1.2.0-alpha Execution Plan

## Milestone Overview

**Version:** v1.2.0-alpha  
**Focus:** Creator planning foundations, workflow tracking improvements, and EHR logic refinement  
**Target:** Strengthen the local-first core loop before expanding features

This plan focuses on practical improvements to the current alpha system. It does not add credential collection, payment processing, private account access, or hidden platform automation.

---

## Deliverables

### D1: Lever History Tracking

**Scope:** Track historical lever selections and outcomes to inform future planning recommendations.

**Changes required:**

- Add `leverHistory` field or relation to user/weekly plan
- Store lever, week, EHR at selection time, and EHR at week end
- Surface in weekly report
- Include lever history in user data export where applicable

**Acceptance criteria:**

- [ ] Each weekly lever selection is persisted with timestamp
- [ ] Weekly report shows previous 4 weeks of lever history
- [ ] History survives user data export
- [ ] No migration breaks existing data

**Dependencies:** None

---

### D2: Mission Completion Tracking

**Scope:** Track whether daily missions are marked complete and compare completion with logged hours.

**Changes required:**

- Add `completedAt` timestamp to `DailyMission` model
- Add UI to mark mission complete
- Show completion rate in weekly report

**Acceptance criteria:**

- [ ] User can mark daily mission as complete
- [ ] Completion timestamp is recorded
- [ ] Weekly report shows X/7 missions completed
- [ ] Completion status resets appropriately for new missions

**Dependencies:** None

---

### D3: EHR Calculation Refinement

**Scope:** Improve EHR calculation to handle edge cases and provide clearer reporting.

**Changes required:**

- Handle weeks with zero logged hours
- Handle weeks with zero revenue
- Add “lever-specific EHR” vs “total EHR” distinction in reports
- Document calculation methodology

**Acceptance criteria:**

- [ ] Zero-hour weeks display “No hours logged” instead of `$0/h` or `NaN`
- [ ] Zero-revenue weeks display “No revenue recorded”
- [ ] Lever EHR only counts hours in `LEVER` category
- [ ] Calculation logic documented in code comments
- [ ] No guaranteed-income or predictive-income language is added to the UI

**Dependencies:** None

---

### D4: ZCcode Spec File

**Scope:** Create machine-readable ZCcode specification files for core system components.

ZCcode is used here as a structured specification and communication format. It is not executable code and should not be described as a replacement for implementation, testing, or review.

**Changes required:**

- Add `zccode/` directory
- Create spec files for mission generation, strategy selection, and EHR calculation
- Document format in `docs/ZCCODE_LANGUAGE.md`

**Acceptance criteria:**

- [ ] `zccode/mission.zc` defines mission generation interface
- [ ] `zccode/strategy.zc` defines strategy selection interface
- [ ] `zccode/ehr.zc` defines EHR calculation interface
- [ ] Format is parseable and consistent
- [ ] Specs remain descriptive, not executable

**Dependencies:** None

---

### D5: Weekly Review Improvements

**Scope:** Enhance weekly review with practical insights based on historical data.

**Changes required:**

- Add week-over-week EHR comparison
- Add execution consistency score based on hours logged compared with target hours
- Add suggested focus based on lever history
- Improve PDF export fields where applicable

**Acceptance criteria:**

- [ ] Weekly review shows EHR change from previous week
- [ ] Execution consistency displayed as percentage
- [ ] Suggested next lever based on simple rules, not hidden automation
- [ ] PDF export includes new fields
- [ ] Insufficient-history cases are handled clearly

**Dependencies:** D1, D3

---

## Issue Specifications

Below are issue specs for GitHub issue creation.

---

### Issue: Lever History Tracking

**Title:** `[Feature] Track lever selection history per week`  
**Labels:** `enhancement`, `v1.2.0`

**Scope:**

- Persist lever selections with metadata: week, EHR at start, EHR at end
- Display in weekly report
- Include in data export

**Acceptance criteria:**

- Historical lever data stored per week
- Visible in reports
- Exported with user data

**Dependencies:** None

---

### Issue: Mission Completion Tracking

**Title:** `[Feature] Add mission completion status and tracking`  
**Labels:** `enhancement`, `v1.2.0`

**Scope:**

- Add `completedAt` field to `DailyMission`
- UI button to mark complete
- Completion rate in weekly report

**Acceptance criteria:**

- Mission can be marked complete
- Timestamp recorded
- Completion rate shown in report

**Dependencies:** None

---

### Issue: EHR Calculation Edge Cases

**Title:** `[Bug/Enhancement] Handle EHR calculation edge cases`  
**Labels:** `bug`, `enhancement`, `v1.2.0`

**Scope:**

- Zero hours handling
- Zero revenue handling
- Lever-specific vs total EHR clarity

**Acceptance criteria:**

- No `NaN` or division errors
- Clear display for missing data
- Calculation documented
- No income-guarantee wording added

**Dependencies:** None

---

### Issue: ZCcode Specification Files

**Title:** `[Feature] Add ZCcode spec files for core components`  
**Labels:** `enhancement`, `documentation`, `v1.2.0`

**Scope:**

- Create `zccode/` directory
- Spec files for mission, strategy, and EHR
- Update ZCcode language docs

**Acceptance criteria:**

- Three spec files created
- Format documented
- Parseable structure
- Specs are clearly described as documentation/specification, not executable runtime code

**Dependencies:** None

---

### Issue: Weekly Review Enhancements

**Title:** `[Feature] Enhance weekly review with insights`  
**Labels:** `enhancement`, `v1.2.0`

**Scope:**

- Week-over-week EHR comparison
- Execution consistency score
- Suggested next lever
- PDF export updates

**Acceptance criteria:**

- Comparison visible in report
- Consistency percentage shown
- Suggestion based on history
- PDF includes new fields
- Recommendations remain user-reviewed decision support

**Dependencies:** Lever history, EHR refinement

---

## Timeline

No fixed dates.

Deliverables are ordered by dependency:

1. D1, D2, D3, and D4 can proceed in parallel
2. D5 depends on D1 and D3 completion

---

## Success Criteria for v1.2.0-alpha

- All five deliverables complete
- CI passes on main
- Documentation updated
- No regression in existing functionality
- Privacy-first and user-controlled positioning preserved
- Release notes written
