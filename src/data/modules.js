// ============================================================
// VISIBILITY INFRASTRUCTURE OS — Module Definitions
// Full prompts sourced from Voice to Visibility Legacy System
// ============================================================

export const INTAKE_FIELDS = [
  { id: 'brandName',       label: 'Brand Name',             type: 'text',     placeholder: 'Your brand or business name', required: true },
  { id: 'businessDesc',    label: 'Business Description',   type: 'textarea', placeholder: 'What your business does and how it creates value', required: true },
  { id: 'niche',           label: 'Niche',                  type: 'text',     placeholder: 'e.g. Executive coaching for women in tech, Leadership consulting' },
  { id: 'primaryOffer',    label: 'Primary Offer',          type: 'textarea', placeholder: 'Your main product, program, or service' },
  { id: 'secondaryOffers', label: 'Secondary Offers',       type: 'textarea', placeholder: 'Other offers: speaking, workshops, courses, memberships' },
  { id: 'targetAudience',  label: 'Target Audience',        type: 'textarea', placeholder: 'Who you serve — be specific about role, age, stage, and context', required: true },
  { id: 'audienceProblem', label: 'Audience Problem',       type: 'textarea', placeholder: 'The main frustration or challenge your audience faces' },
  { id: 'audienceDesire',  label: 'Audience Desire',        type: 'textarea', placeholder: 'What they truly want — the outcome or transformation' },
  { id: 'brandStrengths',  label: 'Brand Strengths',        type: 'textarea', placeholder: 'What sets your brand apart — results, methodology, credibility' },
  { id: 'founderBg',       label: 'Founder Background',     type: 'textarea', placeholder: 'Your professional history, credentials, and experience relevant to this work' },
  { id: 'uniqueMechanism', label: 'Unique Mechanism',       type: 'textarea', placeholder: 'Your proprietary framework, system, or process' },
  { id: 'competitor1',     label: 'Competitor 1',           type: 'text',     placeholder: 'Name or URL' },
  { id: 'competitor2',     label: 'Competitor 2',           type: 'text',     placeholder: 'Name or URL' },
  { id: 'competitor3',     label: 'Competitor 3',           type: 'text',     placeholder: 'Name or URL' },
  { id: 'platforms',       label: 'Platforms',              type: 'text',     placeholder: 'e.g. LinkedIn, Substack, podcast, speaking' },
  { id: 'contentApproach', label: 'Current Content Approach', type: 'textarea', placeholder: 'What you post now, how often, and what format' },
  { id: 'growthGoal',      label: 'Growth Goal',            type: 'textarea', placeholder: 'What you want to grow — audience, reach, visibility, reputation' },
  { id: 'revenueGoal',     label: 'Revenue Goal',           type: 'text',     placeholder: 'e.g. $150K/year, $10K/month, replace corporate salary' },
  { id: 'brandVoice',      label: 'Brand Voice',            type: 'textarea', placeholder: 'How you sound — e.g. direct, warm, strategic, no-nonsense' },
  { id: 'callToAction',    label: 'CTA Preference',         type: 'text',     placeholder: 'e.g. Book a call, Download guide, Join community' },
  { id: 'geography',       label: 'Geography / Market',     type: 'text',     placeholder: 'e.g. US and Canada, global, English-speaking market' },
  { id: 'pricePoint',      label: 'Price Point',            type: 'text',     placeholder: 'e.g. $3,000–$12,000 coaching, $297 course, $97/month' },
  { id: 'salesModel',      label: 'Sales Model',            type: 'text',     placeholder: 'e.g. discovery calls, DMs, sales page, referral' },
  { id: 'constraints',     label: 'Constraints',            type: 'textarea', placeholder: 'Time, budget, tech comfort, bandwidth, team size' },
];

function buildContext(ctx) {
  return `
Business Context:
- Brand name: ${ctx.brandName || '[not provided]'}
- Business description: ${ctx.businessDesc || '[not provided]'}
- Niche: ${ctx.niche || '[not provided]'}
- Primary offer: ${ctx.primaryOffer || '[not provided]'}
- Secondary offers: ${ctx.secondaryOffers || '[not provided]'}
- Target audience: ${ctx.targetAudience || '[not provided]'}
- Main audience problem: ${ctx.audienceProblem || '[not provided]'}
- Main audience desire: ${ctx.audienceDesire || '[not provided]'}
- Brand strengths: ${ctx.brandStrengths || '[not provided]'}
- Founder background: ${ctx.founderBg || '[not provided]'}
- Unique mechanism: ${ctx.uniqueMechanism || '[not provided]'}
- Competitors: ${ctx.competitor1 || 'n/a'}, ${ctx.competitor2 || 'n/a'}, ${ctx.competitor3 || 'n/a'}
- Platforms: ${ctx.platforms || '[not provided]'}
- Current content approach: ${ctx.contentApproach || '[not provided]'}
- Growth goal: ${ctx.growthGoal || '[not provided]'}
- Revenue goal: ${ctx.revenueGoal || '[not provided]'}
- Brand voice: ${ctx.brandVoice || '[not provided]'}
- Call to action preference: ${ctx.callToAction || '[not provided]'}
- Geography or market: ${ctx.geography || '[not provided]'}
- Price point: ${ctx.pricePoint || '[not provided]'}
- Sales model: ${ctx.salesModel || '[not provided]'}
- Constraints: ${ctx.constraints || '[not provided]'}
`.trim();
}

function priorContext(priorOutput) {
  if (!priorOutput) return '';
  return `\n\n---\nSTRATEGIC CONTEXT FROM PRIOR MODULE (treat as fixed unless you identify a serious flaw and explain why):\n${priorOutput}\n---\n`;
}

function qualityBlock() {
  return `\n\nIMPORTANT CONSTRAINTS:
- Do not give generic advice
- Do not repeat obvious best practices unless they are strategically relevant
- Be specific and decisive
- Prioritize differentiation, clarity, and practical usefulness
- If an assumption is weak, say so
- Show where the strategy could fail
- Favor depth over breadth
Before finalizing your answer, pressure-test your recommendations for: vagueness, generic language, weak differentiation, poor monetization logic, lack of audience specificity. Then refine so it is sharper, more actionable, and strategically sound.`;
}

export const MODULES = [
  // ──────────────────────────────────────────────
  // MODULE 1: Business Context + Strategic Analysis
  // ──────────────────────────────────────────────
  {
    id: 'business-context',
    number: 1,
    title: 'Business Context',
    subtitle: 'Strategic Brand and Market Analysis',
    icon: '🏗️',
    description: 'Complete the intake form below. This is your strategic foundation — every module that follows builds on what you define here. Take your time. Precise inputs produce precise strategy.',
    additionalFields: [],
    buildPrompt: (ctx) => `Act as a senior social media growth strategist and brand advisor.

Analyze the business below and create a strategic foundation for social media growth and visible authority. Base your recommendations on positioning, market dynamics, audience fit, and content leverage. Do not give generic advice.

${buildContext(ctx)}

Deliver your analysis in these sections:

## 1. Executive Summary
A clear, confident overview of where this brand stands and its best opportunity.

## 2. Brand Opportunity in the Market
Where the real opening is — what the market is underserving that this brand can address.

## 3. Audience-Market Fit Assessment
How well this offer aligns with the stated audience's actual behavior, desires, and buying patterns.

## 4. Competitive Gap Analysis
Where competitors fall short and where this brand can step in with something sharper.

## 5. Positioning Opportunities
2–3 specific ways this brand could be positioned to stand apart credibly and memorably.

## 6. Platform Recommendations by Priority
Which platforms to prioritize and why — based on audience behavior, not trends.

## 7. Top 5 Strategic Risks or Blind Spots
What could prevent this from working. Be honest.

## 8. Top 5 Strategic Advantages to Exploit
What this brand has that most competitors don't.

---

End with:
- **One-sentence positioning statement**
- **Three strategic directions to choose from**
- A short checklist titled: *What must be true for this to work*
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 2: Audience Psychology
  // ──────────────────────────────────────────────
  {
    id: 'audience-psychology',
    number: 2,
    title: 'Audience Psychology',
    subtitle: 'Messaging Intelligence',
    icon: '🧠',
    description: 'Move beyond demographics into the beliefs, motivations, fears, and emotional triggers that drive your audience\'s decisions. This module builds the messaging intelligence that makes your content resonate.',
    additionalFields: [],
    buildPrompt: (ctx, prior) => `Act as a behavioral psychologist, buyer psychology expert, and messaging strategist.

Using the business context below, build a deep audience psychology profile. Do not stay at surface-level demographics. Focus on beliefs, motivations, emotional triggers, objections, and content behavior.
${priorContext(prior)}
${buildContext(ctx)}

Provide a complete analysis across these dimensions:

## 1. Core Identity of the Audience
Who they are at their core — their self-image, values, and how they see themselves professionally.

## 2. Visible Frustrations
What they openly complain about. What they post about. What they tell colleagues.

## 3. Hidden Frustrations
What they rarely say out loud but feel deeply — shame, fear of irrelevance, unspoken doubt.

## 4. Top Desires and Aspirations
What they genuinely want — in their career, business, lifestyle, and legacy.

## 5. Fears, Hesitations, and Emotional Resistance
What stops them from acting, investing, or committing.

## 6. Common Objections to Buying or Trusting
The exact objections that will kill a sale if they are not addressed in content and messaging.

## 7. What They Are Tired of Hearing
The clichés, bad advice, and overused messaging from others in this market.

## 8. Content Behavior
What they read, share, comment on, and skip. What format and length works for them.

## 9. Language They Use
Exact phrases, vocabulary, and ways they describe their own problem. Use these words.

## 10. What Builds Trust
What they need to see, hear, and feel before they trust a person or brand in this space.

---

Then convert the analysis into:

### 10 Messaging Angles
Direct, differentiated lines that will resonate with this audience.

### 10 Hook Themes
Topic and emotional angles that will stop this audience mid-scroll.

### 10 Trust-Building Content Themes
Content ideas that build credibility and connection without selling.

### 5 Polarizing or Contrarian Angles
Things this brand could say that would differentiate it — without damaging trust.

---

End with a section titled: **Messaging Mistakes to Avoid With This Audience**
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 3: Authority Positioning
  // ──────────────────────────────────────────────
  {
    id: 'authority-positioning',
    number: 3,
    title: 'Authority Positioning',
    subtitle: 'Differentiation System',
    icon: '🎯',
    description: 'Define the authority lane you will own. This module builds the positioning strategy that makes you distinct, credible, and memorable — and gives you the language to express it consistently.',
    additionalFields: [],
    buildPrompt: (ctx, prior) => `Act as a category positioning strategist and personal brand authority expert.

Based on the information below, develop a positioning strategy that makes this brand distinct, credible, and memorable in a crowded market.
${priorContext(prior)}
${buildContext(ctx)}

Build a complete authority positioning system:

## 1. The Category This Brand Should Own
Not a broad topic — a specific, claimable territory that this founder can credibly lead.

## 2. Differentiated Positioning Statement
One clear, specific sentence that says who this is for, what they do, and why it's different.

## 3. Unique Point of View
The core belief or contrarian stance this brand should repeat consistently. What does this brand say that others in the space won't say?

## 4. Industry Myths and Bad Advice to Challenge
What is wrong with how this space typically talks about the problem? What conventional wisdom should this brand push back on?

## 5. Three Signature Frameworks or Concepts
Teachable ideas, named systems, or mental models this brand could become known for. Give them specific names.

## 6. Credibility Drivers to Emphasize
The proof points, experience, and results this brand should surface in content consistently.

## 7. Personality Traits to Project Consistently
How this brand sounds, feels, and behaves in every touchpoint.

## 8. Authority Signals to Build Into Content
The recurring elements — stories, proof, language, formats — that reinforce expertise.

---

Then provide:
- **Go-to-market reputation summary** — what this brand wants to be known for in 12 months
- **5 examples of how this brand should sound** (write them out)
- **5 examples of how this brand should NOT sound** (write them out)

End with: **A simple test for whether future content strengthens or weakens this positioning**
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 4: Competitor White Space
  // ──────────────────────────────────────────────
  {
    id: 'competitor-whitespace',
    number: 4,
    title: 'Competitor White Space',
    subtitle: 'Content Gap Analysis',
    icon: '🔭',
    description: 'Identify where competitors sound the same — and where your brand has room to stand apart. This module reveals the gaps, patterns, and opportunities your market is leaving open.',
    additionalFields: [],
    buildPrompt: (ctx, prior) => `Act as a competitive content strategist.

Evaluate the likely content and positioning patterns of the top players in this niche and identify where this brand can stand out with credibility and distinctiveness.
${priorContext(prior)}
${buildContext(ctx)}

## 1. Most Common Content Themes Competitors Use
What topics, angles, and narratives dominate this space?

## 2. Most Common Positioning Patterns
How do competitors typically present themselves? What language, credentials, and claims repeat?

## 3. Where Competitors Are Blending Together
Where is the market converging on the same message? What content sounds identical across players?

## 4. What Competitor Content Overemphasizes
What gets said too much, too loudly, too repetitively?

## 5. What Competitor Content Neglects
The gaps. What questions go unanswered? What emotions go unaddressed? What audience segments are underserved?

## 6. Underserved Questions, Emotions, and Content Angles
Specific territory that is open and available for this brand to claim.

## 7. Three Strategic White-Space Opportunities
Specific, actionable opportunities where this brand can step in and own something.

## 8. Three Ways to Be Different Without Becoming Confusing
How to differentiate clearly enough to be remembered without going so far off-brand that the audience loses the thread.

---

End with:
### Copy This / Avoid This Table
A clear two-column comparison of content strategies to adopt vs. avoid.

### 10 Differentiation Ideas for Future Content
Specific post angles, formats, or narrative approaches that would set this brand apart.

Focus on strategic white space, not imitation. Be direct about where the market is saturated.
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 5: Content Pillars
  // ──────────────────────────────────────────────
  {
    id: 'content-pillars',
    number: 5,
    title: 'Content Pillars',
    subtitle: 'Conversion-Oriented Strategy',
    icon: '🏛️',
    description: 'Build the five content themes that will drive your visibility, authority, and sales. Each pillar has a strategic purpose — not just a topic bucket — and connects directly to your offers.',
    additionalFields: [],
    buildPrompt: (ctx, prior) => `Act as a social media content strategist focused on growth and conversion.

Using the strategy context below, create 5 content pillars that attract attention, build authority, deepen trust, and move the audience toward becoming customers. Do not create topic buckets — every pillar must have a conversion role.
${priorContext(prior)}
${buildContext(ctx)}

For each of the 5 content pillars, provide:

### Pillar [Number]: [Pillar Name]
1. **Strategic purpose** — what business goal does this pillar serve?
2. **Why it resonates psychologically** — the emotional or belief driver behind engagement
3. **Buyer journey stage** — awareness, consideration, decision, or retention?
4. **Best content formats** — what works for this pillar on this brand's platforms?
5. **10 example post ideas** — specific, actionable, ready to brief or write
6. **Mistakes to avoid** — what goes wrong when this pillar is done poorly?
7. **Natural bridge to offer** — how does this pillar lead naturally into a sale, conversation, or CTA?

---

After the 5 pillars:

### Recommended Pillar Mix by Percentage
How to weight the pillars across a month of content.

### Which Pillar Should Dominate for Growth
And why — based on this audience's specific behavior.

### Which Pillar Should Dominate for Monetization
And why — based on the offer type and audience readiness.
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 6: Platform Strategy
  // ──────────────────────────────────────────────
  {
    id: 'platform-strategy',
    number: 6,
    title: 'Platform Strategy',
    subtitle: 'LinkedIn & Substack Engine',
    icon: '📡',
    description: 'Shape your content specifically for LinkedIn and Substack — the two highest-leverage platforms for visible authority. This module gives you format guidance, tone strategy, and a repurposing workflow.',
    additionalFields: [
      {
        id: 'platformNotes',
        label: 'Additional Platform Notes',
        type: 'textarea',
        placeholder: 'Any specific platform goals, challenges, or context — e.g. starting from scratch on LinkedIn, have 200 Substack subscribers, also speak on podcasts',
      }
    ],
    buildPrompt: (ctx, prior, extras) => `Act as a platform-specific content strategist specializing in LinkedIn authority and Substack audience building for senior professionals.

Adapt the brand strategy specifically for LinkedIn and Substack — the two primary platforms for building visible authority among accomplished professionals.
${priorContext(prior)}
${buildContext(ctx)}
${extras?.platformNotes ? `\nAdditional platform context: ${extras.platformNotes}` : ''}

## LINKEDIN STRATEGY

### 1. What This Audience Wants on LinkedIn
What drives engagement, trust, and connection for this specific audience on this platform.

### 2. Best Content Formats for LinkedIn
Which formats to prioritize — text posts, carousels, articles, video, polls — and why.

### 3. Optimal Tone for LinkedIn
How this brand should sound: authority level, personal disclosure, narrative approach.

### 4. Native LinkedIn Content Ideas
Content that only works on LinkedIn — uses the platform's unique features and culture.

### 5. What to Repurpose to LinkedIn
How to adapt content from other formats — Substack, speaking, long-form writing — for LinkedIn.

### 6. Biggest LinkedIn Mistake to Avoid
The one thing that kills credibility and reach for this type of brand on LinkedIn.

### 7. LinkedIn for Growth, Trust, and Conversion
Specific strategies for each goal on LinkedIn — not generic advice.

---

## SUBSTACK STRATEGY

### 1. What This Audience Wants on Substack
Why someone subscribes, what keeps them reading, what makes them share.

### 2. Best Formats and Structures for Substack
Types of newsletters, essay structures, series formats that work for this brand.

### 3. Optimal Tone for Substack
How this brand sounds in long-form — deeper, more personal, more strategic?

### 4. Native Substack Content Ideas
What to write that couldn't just be a LinkedIn post — depth, insight, originality.

### 5. How Substack Feeds the Business
How newsletter content connects to offers, conversations, and revenue.

### 6. Biggest Substack Mistake to Avoid
What undermines subscriber growth and monetization for this brand type.

---

## Platform Integration

### Platform Priority Ranking
Which platform to build first, and why — based on this brand's goals and audience behavior.

### Repurposing Workflow
A clear, simple workflow to create once and adapt across LinkedIn and Substack without burning out.

### Content Calendar Structure
A suggested weekly rhythm across both platforms that supports growth without overproduction.
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 7: 30-Day Content Plan
  // ──────────────────────────────────────────────
  {
    id: 'content-plan',
    number: 7,
    title: '30-Day Content Plan',
    subtitle: 'Strategic Visibility Calendar',
    icon: '📅',
    description: 'A full month of content mapped with strategic intent — not random posting. Every piece serves a purpose: reach, trust, authority, leads, or conversion.',
    additionalFields: [
      {
        id: 'launchContext',
        label: 'Launch or Campaign Context',
        type: 'textarea',
        placeholder: 'Is there anything specific happening this month? A launch, a speaking event, a seasonal angle, a new offer going live? (optional)',
      }
    ],
    buildPrompt: (ctx, prior, extras) => `Act as a senior content strategist.

Create a 30-day strategic content plan based on the context and content pillars already defined. Every post must serve a deliberate purpose. Avoid generic ideas — every piece should earn its place in the sequence.
${priorContext(prior)}
${buildContext(ctx)}
${extras?.launchContext ? `\nSpecific context for this month: ${extras.launchContext}` : ''}

Create a 30-day plan structured as follows.

For each of the 30 days, provide:
1. **Day number and topic**
2. **Format** (text post, carousel, article, newsletter, short video, etc.)
3. **Hook concept** — the opening angle or tension
4. **Core message** — what this post is really saying
5. **Audience emotion or tension addressed**
6. **Strategic goal** — reach / authority / trust / leads / conversion
7. **CTA** — soft (comment, share, reflect) or hard (click, book, join)
8. **Why this post belongs in the sequence**

---

After the 30 days:

### Monthly Narrative Arc
The strategic story the month tells — beginning, middle, momentum.

### Top 5 Posts Most Likely to Drive Growth
The reach-oriented posts with the highest potential for new audience.

### Top 5 Posts Most Likely to Drive Revenue
The conversion-oriented posts most likely to generate leads or sales.

### Repetition and Balance Check
Flag where the plan becomes repetitive, too sales-heavy, or too light on reach content.

Ensure the month includes: reach-driven posts, trust-building posts, proof/credibility posts, objection-handling posts, offer-adjacent posts, and conversion-focused posts.
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 8: Post Generator
  // ──────────────────────────────────────────────
  {
    id: 'post-generator',
    number: 8,
    title: 'Post Generator',
    subtitle: 'Scroll-Stopping Content',
    icon: '✍️',
    description: 'Generate a specific, high-performing post for any topic in your 30-day plan or content pillar strategy. Input the details and get a ready-to-publish post with hooks, CTAs, and an explanation of why it works.',
    additionalFields: [
      {
        id: 'postTopic',
        label: 'Post Topic',
        type: 'textarea',
        placeholder: 'What is this post about? Be specific — e.g. "Why most executives fail to monetize their expertise in the first year of consulting"',
        required: true,
      },
      {
        id: 'postPlatform',
        label: 'Platform',
        type: 'select',
        options: ['LinkedIn', 'Substack newsletter', 'Substack note', 'LinkedIn Article', 'Other'],
      },
      {
        id: 'postGoal',
        label: 'Strategic Goal',
        type: 'select',
        options: ['Reach / visibility', 'Authority / credibility', 'Trust / connection', 'Leads / audience growth', 'Conversion / offer'],
      },
      {
        id: 'postFormat',
        label: 'Post Format',
        type: 'select',
        options: ['Short text post (under 300 words)', 'Long-form post (300–700 words)', 'Story / narrative post', 'Opinion / contrarian take', 'Practical tips / how-to', 'Personal story', 'Data or insight post', 'Let me choose best format'],
      },
    ],
    buildPrompt: (ctx, prior, extras) => `Act as an elite social media copywriter who specializes in content for senior professional women building authority-based businesses.

Write a high-performing post based on the topic and context below. Avoid clichés, vague motivation, and generic advice. The post must feel specific, credible, and naturally engaging.
${priorContext(prior)}
${buildContext(ctx)}

Post details:
- Topic: ${extras?.postTopic || '[not specified]'}
- Platform: ${extras?.postPlatform || 'LinkedIn'}
- Strategic goal: ${extras?.postGoal || 'Authority / credibility'}
- Format preference: ${extras?.postFormat || 'Let me choose best format'}

Requirements:
- Start with a compelling, specific hook — not a cliché or question
- Use either a strong insight, a sharp opinion, a story, or a practical lesson
- Make the post easy to read and emotionally relevant
- End with a CTA aligned with the strategic goal
- Match the brand voice described in the business context
- Do not use filler, fluff, or overhyped language
- Write for a senior professional audience that has seen everything

---

After the main post, also provide:

### 5 Alternative Hooks
Different ways to open the same post — vary the approach (story, data, opinion, question, statement).

### 3 CTA Variations
Different endings for different goals or comfort levels.

### Why This Post Should Work
A brief, direct explanation of the strategic mechanics behind this specific post.
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 9: Monetization Strategy
  // ──────────────────────────────────────────────
  {
    id: 'monetization-strategy',
    number: 9,
    title: 'Monetization Strategy',
    subtitle: 'Audience Conversion System',
    icon: '💰',
    description: 'Build the path from content and visibility to qualified leads and paying clients. This module maps your audience conversion journey, offer ladder, funnel strategy, and revenue roadmap.',
    additionalFields: [],
    buildPrompt: (ctx, prior) => `Act as a digital monetization strategist and customer journey designer for authority-based businesses.

Build a monetization strategy that turns visibility and social media attention into qualified leads and paying customers. Do not assume followers automatically convert. Tie content to funnel progression. Flag weak monetization assumptions.
${priorContext(prior)}
${buildContext(ctx)}

## 1. Follower-to-Customer Journey
Map the specific steps from first contact to paying client — with realistic conversion logic.

## 2. Funnel Stages from Awareness to Purchase
Define each stage clearly: what the prospect knows, believes, and needs at each point.

## 3. Recommended Offer Ladder
A strategic sequence of offers from entry-level to premium — with pricing logic and conversion roles.

## 4. Pricing Logic and Perceived-Value Considerations
How to price this offer category to maximize both conversions and revenue — avoid underpricing traps.

## 5. Lead Magnet or Entry-Point Ideas
Specific, high-converting lead magnets aligned with the audience's exact problem and stage.

## 6. Content Types Best Suited for Each Funnel Stage
What kind of content moves people from awareness → trust → purchase at each stage?

## 7. Objections That Must Be Addressed Before Buying
The specific beliefs and doubts that must be dismantled through content before a sale can happen.

## 8. CTA Strategy by Funnel Stage
Specific calls to action appropriate for cold, warm, and hot audiences.

## 9. Launch-Based vs Evergreen Recommendations
What should be a launch and what should run on evergreen — and why, based on this business model.

## 10. Key Monetization Risks and How to Avoid Them
What goes wrong most often for this type of business at this stage. Be direct.

---

End with:
- **Simple monetization roadmap** — a visual text map from content → lead → client
- **Fastest path to first revenue** — the most realistic way to generate income in 60 days
- **Most scalable path to long-term revenue** — the model that builds toward $200K+ without requiring constant launches
${qualityBlock()}`,
  },

  // ──────────────────────────────────────────────
  // MODULE 10: Revenue Acceleration
  // ──────────────────────────────────────────────
  {
    id: 'revenue-acceleration',
    number: 10,
    title: 'Revenue Acceleration',
    subtitle: 'Monetization Clarity Engine',
    icon: '🚀',
    description: 'Sharpen your offer structure, refine your pricing, and build a 90-day revenue plan. This final module turns your monetization strategy into a concrete execution roadmap with income milestones and specific daily actions.',
    additionalFields: [
      {
        id: 'currentRevenue',
        label: 'Current Revenue Situation',
        type: 'textarea',
        placeholder: 'Where are you now? e.g. zero revenue, occasional consulting, $2K/month, corporate salary ending in 3 months — be honest',
      },
      {
        id: 'bottleneck',
        label: 'Primary Revenue Bottleneck',
        type: 'textarea',
        placeholder: 'What feels like the biggest obstacle to generating consistent income right now? e.g. unclear offer, no audience, lack of confidence, pricing, inconsistent outreach',
      },
      {
        id: 'timeAvailable',
        label: 'Time Available Per Week',
        type: 'text',
        placeholder: 'e.g. 10 hours, 20 hours, full-time — be realistic',
      }
    ],
    buildPrompt: (ctx, prior, extras) => `Act as a revenue strategist specializing in authority-based businesses for experienced professional women. Prioritize speed, clarity, and results over complexity.

Using the full strategy already developed, build a precise revenue acceleration plan. Focus on the fastest path from expertise to income — not a theoretical framework.
${priorContext(prior)}
${buildContext(ctx)}

Current situation:
- Revenue status: ${extras?.currentRevenue || '[not provided]'}
- Primary bottleneck: ${extras?.bottleneck || '[not provided]'}
- Time available per week: ${extras?.timeAvailable || '[not provided]'}

## 1. Fastest Path to Revenue
What is the single most direct route to income given this business context? Name it, price it, and describe exactly how to sell it in the next 30 days.

## 2. Highest-Leverage Strategy
Of everything this business could do — what one move would produce the most revenue relative to time invested? Be specific. Explain the leverage logic.

## 3. Revenue Leaks
Where is this business likely losing money or leaving it on the table right now? Identify the specific patterns — underpricing, unclear offers, missing follow-up, wrong platform focus.

## 4. Weakest Link Diagnosis
Name the single weakest point in this business's current path to revenue. Is it positioning? Offer clarity? Audience size? Conversion? Visibility? Be direct.

## 5. Top 3 Fixes
The three most impactful changes to make this week or this month. Each fix should be specific, actionable, and tied directly to revenue.

## 6. Offer Optimization
Review the primary offer stated in the business context. How should it be sharpened, repriced, repackaged, or repositioned to convert better? Give exact recommendations.

## 7. Conversion System
What is the minimum viable conversion system for this business right now? Map the exact path: visibility → warm lead → conversation → sale. No complexity — what actually works at this stage.

## 8. 30-Day Revenue Plan
Break down the next 30 days into specific weekly actions:
- **Week 1:** Foundation — what to set up, clarify, or fix
- **Week 2:** Outreach — who to contact and how
- **Week 3:** Visibility — what to publish and why
- **Week 4:** Conversion — how to close warm conversations

Include realistic revenue targets for the month.

## 9. What to Stop Doing
Name 3–5 specific activities, platforms, or habits that are consuming time without producing revenue. Be direct and unapologetic.

## 10. Failure Risks
What are the most likely reasons this business fails to hit its revenue goal? Be honest. Flag the patterns common to this type of business at this stage.

---

End with:

### Complete Strategy Summary
A one-page summary of the key decisions from all 10 Visibility Infrastructure OS modules — positioning, audience, authority lane, content pillars, platform strategy, and revenue path.

### Top Action This Week
The single most important move to make in the next 7 days. One action only.

### Success Test
How will this business know it is on track at 30, 60, and 90 days? Give specific, measurable signals — not vague goals.
${qualityBlock()}`,
  },
];
