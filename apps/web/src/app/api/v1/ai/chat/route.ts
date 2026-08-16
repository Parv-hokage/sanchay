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

    if (
      (userLower.includes('fill') && userLower.includes('application')) ||
      userLower.includes('what is missing')
    ) {
      return NextResponse.json({
        data: {
          content:
            "I will prepare your JEE Main application using the information available in your Sanchay Profile.\n\n**JEE MAIN APPLICATION STATUS**\n\n**PERSONAL INFORMATION**\n✓ Name — From Sanchay Profile\n✓ Date of Birth — From Sanchay Profile\n✓ Gender — From Sanchay Profile\n✓ Category — From Sanchay Profile\n✓ Father's Name — From Sanchay Profile\n\n**ACADEMIC INFORMATION**\n✓ Class 10 Details — From Sanchay Profile\n✓ Class 12 Details — From Sanchay Profile\n\n[Open JEE Application](/services/jee-main/apply)",
          actionCard: {
            title: 'Open JEE Application',
            action: 'NAVIGATE_SERVICE',
            payload: { route: '/services/jee-main/apply' },
          },
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
