---
description: When modifying the economic simulation engine, apply these balanced
  loop equations
---

When modifying the runCountrySystemModel function, always ensure the following balanced loop logic is maintained:

1. ENVIRONMENT ↔ INDUSTRY TRADE-OFF: Industrialization (factories, GDP growth) damages environment. Environmental spending (renewables, social budget for green) heals it. The equilibrium should mean:
   - Very high GDP + low green investment → environment degrades
   - High environment quality → better health, happier populace, higher resilience
   - But too-strict environmentalism stunts GDP growth

2. EDUCATION ↔ RELIGION DYNAMIC:
   - Low education → religion influence rises (community need)
   - High religion + low education → drags on governance, innovation, tech
   - High education → religion influence declines (secularization)
   - High religion + high education → cognitive dissonance (small happiness penalty)
   - Education is boosted by governance quality and social spending

3. GOVERNMENT TYPE MATTERS:
   - Liberal democracy: best innovation/econ, worst at crisis handling
   - Technocratic council: best innovation, moderate stability
   - Dictatorship/military junta: poor econ/innovation, high crisis vulnerability
   - Authoritarian state: moderate stability but high corruption
   - Use GOVERNMENT_MODELS multipliers in all relevant equations

4. ECONOMIC BOOM CYCLE (use computeBoomPhase):
   - Booms require: good leadership + high education + decent environment + stable government
   - Booms overheat → inflation rises → inequality rises → crash risk increases
   - Growth is driven by innovation engine (education, tech, governance, space/intel budget)
   - Productivity engine (infrastructure, energy, resources, jobs, factories)
   - Penalties: inflation, debt, corruption, inequality, war, recession

5. LENDING & CREDIT:
   - computeNationCreditScore determines interest rates
   - computeNationLendingPower determines how much a nation can lend
   - Lending happens via alliances AND sovereign bond markets
   - Interest income boosts lender's stock market
   - Default risk: if borrower's crisisRisk spikes, lender takes a hit

6. GDP GROWTH EQUATION must balance:
   Growth = base + innovation_boost + productivity_boost + budget_economy + budget_social
            + stock_signal + global_market + catch_up + alliance_support
            - pressure (inequality + inflation + migration + corruption)
            - debt_penalty - deficit_penalty - corruption_penalty - recession_penalty
            - war_penalty - education_drag - religion_drag
   Then multiplied by decisionFactor (leadership quality) and gov econ/innovation multipliers
   Clamped to realistic bounds (-0.045 to 0.035 per month)

7. Every nation variable must be clamped to realistic bounds.
   GDP: 0.02-140T, population: 1-1800M, all indexes: 1-100, inflation: 0.2-45%, debt: 8-260%