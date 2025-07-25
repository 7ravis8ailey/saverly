# Claude Instance Instructions - Saverly Mobile Project

## 🚀 Quick Start for New Claude Instances

When starting a new conversation, the user will say something like:
> "Check my Saverly project files and continue where we left off"

**Your immediate response should be:**

1. **Read the project files in this exact order:**
   ```
   /Users/travisbailey/Claude Workspace/Saverly/docs/CLAUDE_INSTRUCTIONS.md (this file)
   /Users/travisbailey/Claude Workspace/Saverly/docs/saverly-mobile-prd.md
   /Users/travisbailey/Claude Workspace/Saverly/docs/project-todos.md
   ```

2. **Set your working directory:**
   ```bash
   cd "/Users/travisbailey/Claude Workspace/Saverly"
   ```

3. **MANDATORY: Create execution plan and update logs:**
   - Read current todo status and identify next 5-10 actionable tasks
   - Create a detailed execution plan with time estimates
   - Update the project-todos.md with any new tasks discovered
   - Provide a status report showing exactly what you'll work on

4. **Acknowledge what you've learned:**
   - Current project phase and completion percentage
   - Last completed tasks (with dates)
   - Next priority tasks (with your planned approach)
   - Any blockers or dependencies
   - Your proposed work session agenda

## 📋 Project Overview (Quick Reference)

### What We're Building
- **React Native mobile app** (iOS/Android) for local coupon marketplace
- **Supabase backend** (PostgreSQL + Auth + Edge Functions)
- **React web admin dashboard** (deployed on Netlify)
- **Migration from existing Replit codebase** with Base44 API keys

### Key Technologies
- **Frontend**: React Native (Expo), React (web admin)
- **Backend**: Supabase (PostgreSQL, Auth, Real-time, Edge Functions)
- **Payments**: Stripe (keys migrated from Base44)
- **Maps**: Google Maps API (keys migrated from Base44)
- **Deployment**: EAS (mobile), Netlify (web), Supabase (backend)

### Critical Files
- `saverly-mobile-prd.md` - Complete product requirements
- `project-todos.md` - Master task list with progress tracking
- `CLAUDE_INSTRUCTIONS.md` - This instruction file

## 🔄 Todo List Management Protocol

### ✅ MANDATORY: Update todos.md after EVERY work session

**When you complete a task:**
1. Change status from `[ ]` to `[x]` 
2. Update the completion date
3. Update the Progress Tracking section
4. Add any new subtasks discovered

**When you discover new tasks:**
1. Add them to the appropriate phase section
2. Use the task naming convention: `CATEGORY-###`
3. Include priority level and dependencies
4. Update the overall progress percentage

**Task Status Format:**
```markdown
- [x] **SETUP-001**: Create React Native project ✅ 2025-01-25
- [ ] **SETUP-002**: Set up Supabase project (In Progress)
- [ ] **SETUP-003**: Migrate API keys (Blocked: waiting for Base44 access)
```

### 📊 Progress Tracking Updates
Always update these sections in `project-todos.md`:

```markdown
### Completion Status
- **Phase 1**: 60% (3/5 tasks complete) ✅ Updated 2025-01-25
- **Phase 2**: 0% (0/12 tasks complete)  
- **Overall**: 10% (3/31 core tasks complete) ✅ Updated 2025-01-25

### Recent Completed Tasks (Last 7 Days)
- ✅ SETUP-001: React Native project created (2025-01-25)
- ✅ SETUP-004: Authentication configured (2025-01-25)
- ✅ AUTH-001: Login screens implemented (2025-01-25)
```

## 🎯 Development Workflow

### Priority Order (Always Follow This)
1. **Read current todos** - Understand what's in progress
2. **Check for blockers** - Address any dependencies first
3. **Focus on current sprint** - Don't jump ahead to future phases
4. **Update todos frequently** - After each major milestone
5. **Test as you go** - Don't accumulate technical debt

### Code Development Guidelines
- **Always use TypeScript**
- **Follow project structure** outlined in PRD
- **Test critical functions** (auth, payments, redemptions)
- **Update documentation** as features are added
- **Commit frequently** with descriptive messages

### File Organization
```
saverly-mobile-project/
├── CLAUDE_INSTRUCTIONS.md     # This file
├── saverly-mobile-prd.md      # Product requirements
├── project-todos.md           # Master task list
├── src/                       # Source code (when created)
├── docs/                      # Additional documentation
└── README.md                  # Project README (to be created)
```

## 🚨 Critical Reminders

### ⚠️ ALWAYS DO THESE THINGS

1. **Check todos first** - Read the current status before starting work
2. **Work in the correct directory** - `/Users/travisbailey/saverly-mobile-project/`
3. **Update progress frequently** - Don't wait until end of session
4. **Follow the phases** - Don't skip ahead without completing prerequisites
5. **Document new discoveries** - Add tasks as you find new requirements

### ⚠️ NEVER DO THESE THINGS

1. **Don't start work** without reading all three instruction files
2. **Don't forget to update todos** - This breaks continuity for next instance
3. **Don't deviate from architecture** - Stick to React Native + Supabase
4. **Don't skip testing** - Test critical flows as you build them
5. **Don't commit sensitive data** - Use environment variables for API keys

## 📝 Communication Protocol

## 🎯 MANDATORY: Execution Planning & User Visibility

### 📋 Required Response Template for New Instances

When resuming work, provide this EXACT format so the user can track progress:

```markdown
# 🚀 Saverly Project - Session Start Report

## 📊 Current Status
- **Phase**: [Current phase name] ([X]% complete)
- **Overall Progress**: [Y]% ([completed]/[total] tasks)
- **Last Session**: [Date] - [What was completed]
- **Active Work**: [Current task in progress]

## 🎯 Today's Execution Plan
**Session Goal**: [Primary objective for this session]
**Time Estimate**: [Estimated work time]

### Next 5 Tasks (In Priority Order):
1. **[TASK-ID]**: [Task description] 
   - **Approach**: [How you'll tackle it]
   - **Time**: [Estimate]
   - **Dependencies**: [Any blockers]

2. **[TASK-ID]**: [Task description]
   - **Approach**: [How you'll tackle it]  
   - **Time**: [Estimate]

[Continue for 3-5 tasks]

## 🚨 Blockers & Dependencies
- [List any blockers that need user attention]
- [API keys needed, decisions required, etc.]

## 📈 Success Metrics for This Session
- [ ] [Specific deliverable 1]
- [ ] [Specific deliverable 2] 
- [ ] [Update todos.md with progress]

**Ready to begin? I'll update you every 15-30 minutes with progress.**
```

### 🔄 Mid-Session Progress Updates

**MANDATORY**: Every 15-30 minutes, provide updates in this format:

```markdown
## ⏰ Progress Update - [Time]

### ✅ Completed (Last 30 min):
- [x] [Task completed with details]
- [x] [Another completed task]

### 🔄 Currently Working On:
- **[TASK-ID]**: [Current task]  
- **Status**: [X]% complete
- **Next Step**: [What you're doing next]
- **ETA**: [When you expect to finish]

### 🆙 Coming Up Next:
- [Next 1-2 tasks in queue]

### 🚨 Issues/Discoveries:
- [Any problems encountered]
- [New tasks discovered and added to todos]
```

### When User Asks "Where are we?"
Always provide the full status template above, plus:
- Show exact file changes made
- List new todos added
- Highlight any decisions needed from user

### When User Asks for Next Steps
1. Check current todos
2. Identify next 3-5 actionable tasks
3. Suggest priority order
4. Mention any prerequisites or blockers
5. Ask for confirmation before proceeding

### When Reporting Completion
1. **Update todos.md immediately**
2. **Summarize what was accomplished**
3. **Note any new discoveries or tasks**
4. **Recommend next steps**
5. **Commit changes if working with git**

## 🔧 Technical Setup Reminders

### Environment Variables (From Base44 Migration)
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` - From Base44 app
- `STRIPE_SECRET_KEY` - From Base44 backend  
- `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` - From Base44 app
- `EXPO_PUBLIC_SUPABASE_URL` - New Supabase project
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - New Supabase project

### Key Commands to Remember
```bash
# Project setup
cd /Users/travisbailey/saverly-mobile-project
npx create-expo-app --template

# Database setup
npx supabase init
npx supabase start

# Development
npm run dev
npm run test

# Deployment
eas build
eas submit
```

## 🔄 Handoff Checklist

### Before Ending Session (MANDATORY)
- [ ] All todos.md updates completed
- [ ] Progress percentages updated  
- [ ] New tasks documented
- [ ] Current work status noted
- [ ] Any blockers or dependencies documented
- [ ] **Create session log using template**: Copy `docs/session-log-template.md` to `docs/sessions/session-[YYYYMMDD-HHMM].md` and fill it out completely
- [ ] Git commit with descriptive message including session summary
- [ ] Files saved and organized
- [ ] Next session priorities clearly documented

### 📋 Session Logging (MANDATORY)
Every Claude instance MUST create a detailed session log:

1. **Copy the template**: `cp docs/session-log-template.md docs/sessions/session-$(date +%Y%m%d-%H%M).md`
2. **Fill out completely**: Every section must be completed
3. **Update every 15-30 minutes**: Keep the user informed of progress
4. **End with handoff**: Clear instructions for next instance

This creates a **complete audit trail** so the user can:
- Track exactly what work was done
- See time estimates vs actual time
- Understand decision-making process
- Monitor productivity and identify bottlenecks
- Have confidence in project progress

### Testing Next Instance Handoff
**Ask the user to start a new conversation and say:**
> "Check my Saverly project files and continue where we left off"

**Verify the new instance:**
- [ ] Reads all three files correctly
- [ ] Understands current project status
- [ ] Identifies next priority tasks
- [ ] Knows how to update todos
- [ ] Follows development protocols

## 📞 Emergency/Troubleshooting

### If Project Files Are Missing
1. Check the exact path: `/Users/travisbailey/saverly-mobile-project/`
2. Use `ls` command to verify files exist
3. Ask user to confirm the correct directory
4. Recreate files from memory if necessary (but inform user)

### If Todos Are Outdated
1. **Don't assume anything** - Ask user for current status
2. Review git commits if repository exists
3. Rebuild task list based on actual code state
4. Update progress tracking to match reality

### If Instructions Are Unclear
1. **Ask specific questions** rather than guessing
2. **Reference the PRD** for architectural decisions
3. **Follow established patterns** from previous work
4. **Document clarifications** for future instances

---

## 🎯 Success Metrics for Claude Instances

### Excellent Performance Indicators
- ✅ Always reads all project files before starting
- ✅ Updates todos consistently and accurately
- ✅ Maintains focus on current phase priorities
- ✅ Documents new discoveries and tasks
- ✅ Follows technical architecture from PRD
- ✅ Provides clear status updates to user

### Red Flags (Avoid These)
- ❌ Starts work without reading project status
- ❌ Forgets to update todos after completing tasks
- ❌ Jumps to future phases without completing current work
- ❌ Deviates from established architecture
- ❌ Loses track of project progress
- ❌ Breaks continuity for next instance

---

**Remember**: The goal is seamless continuity between Claude instances. Each new instance should be able to pick up exactly where the previous one left off, with zero confusion or lost context.

**Version**: 1.0  
**Created**: 2025-01-25  
**Last Updated**: 2025-01-25  
**Next Review**: When major project changes occur