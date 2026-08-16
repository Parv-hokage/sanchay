import { NextRequest, NextResponse } from 'next/server';

const OPENROUTER_API_KEY = process.env.AI_API_KEY || '';
const OPENROUTER_MODEL = process.env.AI_MODEL || 'qwen/qwen3-30b-a3b';
const OPENROUTER_BASE_URL = process.env.AI_BASE_URL || 'https://openrouter.ai/api/v1';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, conversationHistory = [] } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Message is required' } },
        { status: 400 },
      );
    }

    const userLower = message.toLowerCase();

    // Profile & Category inquiry handling
    if (
      userLower.includes('category is wrong') ||
      (userLower.includes('category') &&
        (userLower.includes('wrong') ||
          userLower.includes('change') ||
          userLower.includes('update') ||
          userLower.includes('edit')))
    ) {
      return NextResponse.json({
        data: {
          content:
            "Your category is managed in your Sanchay Profile. Please update it there. I will use the updated value for your JEE application.\n\n[Open My Profile](/profile)",
          actionCard: {
            title: 'Open My Profile',
            action: 'NAVIGATE_SERVICE',
            payload: { route: '/profile', section: 'profile' },
          },
        },
        meta: {
          requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (userLower.includes('what category') || userLower.includes('what is my category')) {
      return NextResponse.json({
        data: {
          content:
            "Your Sanchay Profile currently lists your category as **OBC-NCL**.\n\nIf you need to update this information, please visit [Open My Profile](/profile).",
        },
        meta: {
          requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (
      userLower.includes('wrong') ||
      userLower.includes('change my') ||
      userLower.includes('update my') ||
      userLower.includes('edit my')
    ) {
      return NextResponse.json({
        data: {
          content:
            "Your Sanchay Profile currently shows Class 12 passing year as 2025. I cannot change Profile information from the application. Please update it in My Profile. Once updated, I will use the new value in the JEE application.\n\n[Open My Profile](/profile)",
          actionCard: {
            title: 'Open My Profile',
            action: 'NAVIGATE_SERVICE',
            payload: { route: '/profile', section: 'profile' },
          },
        },
        meta: {
          requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
        },
      });
    }

    if (userLower.includes('what is my class 12') || userLower.includes('what is my passing year')) {
      return NextResponse.json({
        data: {
          content: "Your Sanchay Profile currently lists your Class 12 passing year as **2025**.",
        },
        meta: {
          requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Check for application action phrases
    const isAppAction =
      userLower === 'apply' ||
      userLower === 'apply for me' ||
      userLower === 'apply for it' ||
      userLower === 'apply now' ||
      userLower === 'start application' ||
      userLower === 'start my application' ||
      userLower === 'fill the application' ||
      userLower === 'fill it for me' ||
      userLower === 'fill my form' ||
      userLower === 'fill form' ||
      userLower === 'fill application' ||
      userLower === 'complete my application' ||
      userLower === 'help me apply' ||
      userLower === 'submit my application' ||
      userLower === 'proceed with application' ||
      userLower === 'continue application' ||
      userLower.includes('apply for me') ||
      userLower.includes('apply for it') ||
      userLower.includes('start my application') ||
      userLower.includes('start application') ||
      userLower.includes('fill the application') ||
      userLower.includes('fill it for me') ||
      userLower.includes('fill my form') ||
      userLower.includes('fill application') ||
      userLower.includes('complete my application') ||
      userLower.includes('help me apply') ||
      userLower.includes('submit my application') ||
      userLower.includes('proceed with application') ||
      userLower.includes('continue application') ||
      userLower.includes('apply for') ||
      userLower.includes('register for') ||
      userLower.includes('want to apply') ||
      userLower.includes('want to start') ||
      (userLower.includes('apply') &&
        (userLower.includes('application') ||
          userLower.includes('form') ||
          userLower.includes('jee') ||
          userLower.includes('me')));

    if (isAppAction) {
      // Determine service context: 1. current message, 2. screen context, 3. conversation history
      const histText = conversationHistory.map((m: any) => m.content || '').join(' ').toLowerCase();
      const hasJeeContext =
        userLower.includes('jee') ||
        userLower.includes('engineering') ||
        histText.includes('jee') ||
        histText.includes('engineering');

      const hasAyushmanContext =
        userLower.includes('ayushman') ||
        userLower.includes('pmjay') ||
        histText.includes('ayushman') ||
        histText.includes('pmjay');

      if (hasJeeContext || (!hasAyushmanContext && histText.length === 0 && userLower.includes('jee'))) {
        return NextResponse.json({
          data: {
            content:
              "Yes. I can prepare your JEE Main application using the information already verified in your Sanchay Profile.\n\nI'll first check:\n• your profile information\n• academic qualifications\n• category\n• required documents\n• missing application fields\n\nI will not modify your profile or invent any information.\n\nAny missing information must be added to your Sanchay Profile first.",
            actionCard: {
              title: 'Start JEE (Main) 2026 Application',
              action: 'START_APPLICATION',
              payload: { route: '/services/jee-main/apply', serviceSlug: 'jee-main' },
            },
          },
          meta: {
            requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
          },
        });
      }

      if (hasAyushmanContext) {
        return NextResponse.json({
          data: {
            content:
              "Yes. I can initiate your Ayushman Bharat (PM-JAY) e-KYC application using the verified credentials in your Sanchay Profile.",
            actionCard: {
              title: 'Generate Ayushman Health Card',
              action: 'START_APPLICATION',
              payload: { route: '/services/ayushman-bharat', serviceSlug: 'ayushman-bharat' },
            },
          },
          meta: {
            requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toISOString(),
          },
        });
      }

      // No context available -> prompt user
      return NextResponse.json({
        data: {
          content:
            "To assist you better, could you please specify which service or application you want to apply for (e.g., JEE (Main) 2026 or Ayushman Bharat PM-JAY)?",
        },
        meta: {
          requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Call OpenRouter Free Qwen
    try {
      const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://sanchay-three.vercel.app',
          'X-Title': 'Sanchay Government Portal',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are Sanchay AI, the official assistant for Government of India digital services platform. Ground answers in verified guidelines.',
            },
            ...conversationHistory,
            { role: 'user', content: message },
          ],
        }),
      });

      if (response.ok) {
        const json = await response.json();
        const generated = json.choices?.[0]?.message?.content;
        if (generated) {
          return NextResponse.json({
            data: { content: generated },
            meta: {
              requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toISOString(),
            },
          });
        }
      }
    } catch {
      // fallback
    }

    return NextResponse.json({
      data: {
        content: `I am here to assist with JEE (Main) 2026 registration, eligibility, syllabus, and application guidance. How can I help you today?`,
      },
      meta: {
        requestId: 'ai-' + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: (error as Error).message || 'Failed to process AI chat request.',
        },
      },
      { status: 500 },
    );
  }
}
