# Pathwise - Product Requirements Document

**Author:** Ansu Sharma  
**Version:** 1.0  
**Last Updated:** January 2026  

---

## Overview

Pathwise is a career guidance platform for students in Classes 10-12. It helps students figure out what career path suits them based on a quick assessment, then provides actionable guidance on streams, entrance exams, and degrees.

### The Problem

Students face tough decisions after Class 10 and 12:
- Which stream to choose (Science/Commerce/Arts)?
- Which entrance exams to prepare for?
- What degree to pursue?
- What careers are even out there?

Most students rely on parents, teachers, or expensive counselors who often push outdated or generic advice. There's no accessible tool that gives personalized, actionable career guidance.

### The Solution

A 15-question assessment that:
- Takes 5-10 minutes to complete
- Uses weighted scoring across 9 career categories
- Generates 3 personalized career recommendations using AI
- Provides a complete roadmap (stream → exams → degree → career)
- Includes curated learning resources

---

## Target Users

**Primary:** Students in Class 11 and 12 who are confused about career choices

**Secondary:** Parents who want to help their children make informed decisions

### User Profile

| Attribute | Details |
|-----------|---------|
| Age | 14-18 years |
| Location | India (Tier 1-3 cities) |
| Context | About to choose stream or preparing for entrance exams |
| Pain Point | Overwhelmed by options, unclear on what suits them |

---

## Features

### Current (v1.0)

| Feature | Description |
|---------|-------------|
| User Authentication | Email/password signup and login via Firebase |
| Career Assessment | 15 questions across aptitude, personality, and goals |
| AI Career Generation | 3 career recommendations with match percentages |
| Career Roadmap | Stream selection, entrance exams, degree path |
| Learning Resources | Curated courses, books, and channels per career |
| Assessment History | View and retake past assessments |
| Analytics Dashboard | Admin-only metrics tracking (DAU, MAU, completion rates) |

### Potential Future Additions

| Feature | Priority |
|---------|----------|
| Google Sign-In | High |
| Hindi/Regional Language Support | High |
| Compare Careers Side-by-Side | Medium |
| College Recommendations | Medium |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS |
| Auth | Firebase Authentication |
| Database | Supabase (PostgreSQL) |
| AI | Groq API (LLaMA 3 70B) |
| Hosting | Vercel |

---

## Assessment Design

The 15 questions are split into 3 sections:

| Section | Questions | Focus |
|---------|-----------|-------|
| Academic Strengths | 1-5 | Subject preferences, problem-solving style |
| Work Style | 6-10 | Pressure handling, discipline, communication |
| Goals & Values | 11-15 | Career motivation, preparation commitment |

Each answer carries weighted scores mapped to 9 career categories:
- Technology & Engineering
- Healthcare & Medicine
- Business & Finance
- Law & Social Sciences
- Arts & Design
- Defense & Armed Forces
- Aviation & Aerospace
- Sports & Athletics
- Civil Services & Government

---

## Metrics Tracked

| Category | Metrics |
|----------|---------|
| Engagement | DAU, MAU, session duration |
| Assessment | Completion rate, average time, drop-off points |
| Careers | Most recommended careers, category distribution |
| Retention | D1, D7 return rates |

---

## Distribution Strategy

### Phase 1: Beta (Current)
- Personal network sharing
- Word of mouth
- Target: 100-500 users

### Phase 2: Growth
- Social media (Instagram, LinkedIn)
- School/coaching center partnerships
- Student community groups
- Target: 5,000+ users

### Channels
- Direct sharing in WhatsApp groups
- LinkedIn posts about career guidance
- Instagram reels on career confusion
- Partnership with school counselors

---

## Competitive Landscape

| Competitor | What They Do | Gap |
|------------|--------------|-----|
| iDreamCareer | Paid career counseling | Expensive (₹5,000+), not instant |
| Mindler | Assessment + counselor calls | Complex, requires booking |
| Manual Counselors | One-on-one sessions | Expensive, limited availability |

**Pathwise Advantage:** Free, instant, AI-powered, and designed specifically for the Indian education system (streams, JEE, NEET, UPSC context).

---

## Risks

| Risk | Mitigation |
|------|------------|
| AI gives irrelevant careers | Structured prompts + fallback scoring system |
| Users don't complete assessment | Keep it short (15 questions), show progress |
| Trust issues with AI advice | Transparent methodology, show scoring logic |

---

## Success Criteria

| Milestone | Target |
|-----------|--------|
| Assessments completed | 500+ |
| Completion rate | >80% |
| User return rate (D7) | >15% |
| Positive feedback | Users find recommendations helpful |

---

## About

Built by **Ansu Sharma** as a solution to the career confusion problem that affects millions of students every year. The goal is to make quality career guidance accessible to everyone, not just those who can afford expensive counselors.

---

*This is a living document and will be updated as the product evolves.*
