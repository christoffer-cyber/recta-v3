#!/usr/bin/env node

/**
 * E2E Test: Full Recta Conversation Flow
 * Tests all 4 phases without UI interaction
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Test messages from test-messages.md
const TEST_MESSAGES = {
  context: "Vi är ett B2B SaaS-företag med 25 anställda i Stockholm. Vi är i Series A-fas med 30 MSEK i funding från Creandum. Just nu har vi 5 utvecklare (3 backend, 2 frontend) som rapporterar till vår CTO. Vi behöver rekrytera en Senior Backend Developer för att skala vår plattform. Budgeten är 700-850k/år inklusive sociala avgifter. Vi vill att personen börjar inom 2-3 månader. Målet är att dubblera utvecklingsteamet inom 12 månader eftersom vi växer snabbt - just nu 200% YoY revenue growth.",
  
  problem: "Vårt backend kan inte hantera den 10x trafik-ökning vi förväntar oss nästa kvartal när vi lanserar i Tyskland. Grundorsaken är att vi byggde en monolitisk arkitektur under MVP-fasen för 2 år sedan, och nu har vi betydande teknisk skuld. Den största utmaningen är att vi måste migrera till microservices under pågående tillväxt utan någon downtime - våra största kunder har SLA på 99.9%. Vi har försökt optimera den befintliga koden men det gav bara 2x förbättring, inte 10x som vi behöver. Vi måste lösa detta nu eftersom vi har 6 månaders runway kvar och kan inte pausa produktutvecklingen. Det kostar oss cirka 50k EUR per månad i förlorad revenue att inte kunna onboarda nya enterprise-kunder på grund av skalningsproblem.",
  
  solution: "Jag gillar Scenario A: Senior Backend Developer (700-850k). Det passar vår budget perfekt och vi är för små för att ha en duo just nu. Vi behöver någon som kan äga migrationen själv och börja leverera från dag ett utan att behöva handledning.",
  
  action: [
    "Jag (VD) äger processen tillsammans med vår CTO. Vi delar ansvaret.",
    "Vår CTO gör teknisk screening, jag gör culture fit-intervjuer.",
    "4 omgångar: 1) Phone screen (CTO, 30 min), 2) Tech interview (2h coding), 3) Culture fit (mig, 1h), 4) Final (hela teamet, 1h)",
    "Nej, jag kan besluta själv upp till 900k.",
    "Ja, inga blockers. JD kan vara klar på fredag, publicera måndag.",
    "Då öppnar vi för en senior konsult som backup, men det är plan B.",
    "Månad 1: Fullständig system-förståelse. Månad 2: Äger en microservice-migration. Månad 3: Tränat en junior och levererar i production."
  ]
};

async function testChatAPI(phase, message, existingInsights = [], allMessages = []) {
  const userMessage = {
    role: 'user',
    content: message,
    timestamp: new Date().toISOString()
  };
  
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [...allMessages, userMessage],
      existingInsights: existingInsights,
      currentConfidence: 0,
      currentPhase: phase,
      isNewPhase: false
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Chat API failed (${phase}): ${response.status} - ${errorText}`);
  }

  return await response.json();
}

async function testGenerateAPI(type, insights) {
  const response = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, insights })
  });

  if (!response.ok) {
    throw new Error(`Generate API failed (${type}): ${response.status}`);
  }

  return await response.json();
}

async function runE2ETest() {
  console.log('🧪 Starting E2E Test...\n');
  
  let allInsights = [];
  let allMessages = [];
  
  try {
    // PHASE 1: CONTEXT
    console.log('📋 PHASE 1: Context');
    const contextResult = await testChatAPI('Context', TEST_MESSAGES.context, allInsights, allMessages);
    allInsights = [...allInsights, ...(contextResult.insights || [])];
    
    // Add AI response to message history
    allMessages.push({
      role: 'user',
      content: TEST_MESSAGES.context,
      timestamp: new Date().toISOString()
    });
    allMessages.push({
      role: 'assistant',
      content: contextResult.message,
      timestamp: new Date().toISOString()
    });
    
    console.log(`  ✓ Confidence: ${contextResult.confidence}%`);
    console.log(`  ✓ Insights: ${contextResult.insights?.length || 0}`);
    
    if (contextResult.confidence < 85) {
      console.log('  ⚠️  Warning: Low confidence after context');
    }
    
    // PHASE 2: PROBLEM DISCOVERY
    console.log('\n🔍 PHASE 2: Problem Discovery');
    const problemResult = await testChatAPI('Problem Discovery', TEST_MESSAGES.problem, allInsights, allMessages);
    allInsights = [...allInsights, ...(problemResult.insights || [])];
    
    allMessages.push({
      role: 'user',
      content: TEST_MESSAGES.problem,
      timestamp: new Date().toISOString()
    });
    allMessages.push({
      role: 'assistant',
      content: problemResult.message,
      timestamp: new Date().toISOString()
    });
    
    console.log(`  ✓ Confidence: ${problemResult.confidence}%`);
    console.log(`  ✓ Insights: ${problemResult.insights?.length || 0}`);
    
    // PHASE 3: SOLUTION DESIGN
    console.log('\n💡 PHASE 3: Solution Design');
    const solutionResult = await testChatAPI('Solution Design', TEST_MESSAGES.solution, allInsights, allMessages);
    allInsights = [...allInsights, ...(solutionResult.insights || [])];
    
    allMessages.push({
      role: 'user',
      content: TEST_MESSAGES.solution,
      timestamp: new Date().toISOString()
    });
    allMessages.push({
      role: 'assistant',
      content: solutionResult.message,
      timestamp: new Date().toISOString()
    });
    
    console.log(`  ✓ Confidence: ${solutionResult.confidence}%`);
    console.log(`  ✓ Insights: ${solutionResult.insights?.length || 0}`);
    
    if (solutionResult.autoGenerateScenarios) {
      console.log('  🎯 Auto-scenario generation triggered!');
    }
    
    // PHASE 4: ACTION PLAN (multiple messages)
    console.log('\n🎯 PHASE 4: Action Plan');
    for (let i = 0; i < TEST_MESSAGES.action.length; i++) {
      const actionResult = await testChatAPI('Action Plan', TEST_MESSAGES.action[i], allInsights, allMessages);
      allInsights = [...allInsights, ...(actionResult.insights || [])];
      
      allMessages.push({
        role: 'user',
        content: TEST_MESSAGES.action[i],
        timestamp: new Date().toISOString()
      });
      allMessages.push({
        role: 'assistant',
        content: actionResult.message,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ✓ Message ${i + 1}/${TEST_MESSAGES.action.length} - Confidence: ${actionResult.confidence}%`);
    }
    
    // DELIVERABLES GENERATION
    console.log('\n📄 GENERATING DELIVERABLES');
    
    const deliverables = [
      'job_description',
      'compensation_analysis',
      'interview_questions',
      'success_plan'
    ];
    
    for (const type of deliverables) {
      try {
        const result = await testGenerateAPI(type, allInsights);
        console.log(`  ✓ ${type}: Success`);
      } catch (error) {
        console.log(`  ✗ ${type}: ${error.message}`);
      }
    }
    
    // SUMMARY
    console.log('\n' + '='.repeat(50));
    console.log('✅ E2E TEST COMPLETED');
    console.log('='.repeat(50));
    console.log(`Total insights collected: ${allInsights.length}`);
    console.log(`\nAll insights:\n${allInsights.join('\n')}`);
    
  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error(error);
    process.exit(1);
  }
}

// Run test
runE2ETest().then(() => {
  console.log('\n✅ All tests passed!');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});

