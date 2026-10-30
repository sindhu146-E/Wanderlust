import type { Destination } from './supabase';
import { DESTINATIONS, TOURS } from './travelData';

// A travel-specialized voice engine that detects intent from natural
// language and responds with real data from the destinations/tours
// catalog. This is a deterministic demo stand-in for an LLM backend —
// it runs fully client-side.

const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^\w\s$]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const has = (text: string, ...words: string[]) =>
  words.some((w) => text.includes(w));

export type VoiceResult = {
  response: string;
  intent: string;
  matchedDestination?: string;
};

export function generateTravelResponse(input: string): VoiceResult {
  const lower = normalize(input);

  // 1. Greeting
  if (
    has(lower, 'hello', 'hi ', 'hey', 'good morning', 'good afternoon') ||
    lower === 'hi'
  ) {
    return {
      response:
        "Hello! I'm your Wanderlust travel assistant. I can help you find destinations, compare tours, check prices, plan itineraries, or start a booking. What kind of trip are you dreaming about?",
      intent: 'greeting',
    };
  }

  // 2. Booking / reservation intent
  if (
    has(
      lower,
      'book',
      'reserve',
      'reservation',
      'sign up',
      'register',
      'enroll',
    )
  ) {
    const dest = findDestinationInText(lower);
    if (dest) {
      return {
        response: `I'd love to book your ${dest.name} trip! The ${dest.tagline.toLowerCase()} starts at $${dest.price_from} per person for ${dest.duration_days} days. To get started, I'll need your name, email, preferred travel dates, and number of travelers. Would you like to fill out the booking form, or should I walk you through it?`,
        intent: 'booking',
        matchedDestination: dest.slug,
      };
    }
    return {
      response:
        "I can help you book! Which destination are you interested in? We have tours to Bali, Santorini, Kyoto, Patagonia, Marrakech, and Iceland. Once you pick one, I'll walk you through the details.",
      intent: 'booking',
    };
  }

  // 3. Price / cost / budget intent
  if (has(lower, 'price', 'cost', 'how much', 'budget', 'expensive', 'cheap', 'afford')) {
    const dest = findDestinationInText(lower);
    if (dest) {
      return {
        response: `Our ${dest.name} trips start at $${dest.price_from} per person for ${dest.duration_days} days. That includes hotels, daily breakfast, local guides, and the main activities. Would you like a full price breakdown or help comparing it with another destination?`,
        intent: 'pricing',
        matchedDestination: dest.slug,
      };
    }
    return {
      response:
        'Our trips range from $1,190 for Marrakech to $2,890 for the Patagonia W Trek. Bali is $1,290, Santorini $1,690, Iceland $1,990, and Kyoto $2,100 — all per person. What is your budget range, and I can recommend the best fit?',
      intent: 'pricing',
    };
  }

  // 4. Itinerary / schedule / what do we do intent
  if (has(lower, 'itinerary', 'schedule', 'plan', 'what do we do', 'what will we', 'activities', 'what is included', 'include')) {
    const dest = findDestinationInText(lower);
    if (dest) {
      const tour = TOURS.find((t) => t.destination_slug === dest.slug);
      if (tour) {
        const firstThree = tour.itinerary
          .slice(0, 3)
          .map((d) => `Day ${d.day}: ${d.title}`)
          .join('; ');
        return {
          response: `Here is a preview of the ${tour.title} itinerary: ${firstThree}… and more over ${tour.duration_days} days. It includes ${tour.includes.slice(0, 4).join(', ')}, and more. Want me to walk through the full day-by-day plan?`,
          intent: 'itinerary',
          matchedDestination: dest.slug,
        };
      }
    }
    return {
      response:
        'Each tour comes with a detailed day-by-day itinerary. Which destination are you curious about? I can walk you through what you will do each day, what is included, and what to pack.',
      intent: 'itinerary',
    };
  }

  // 5. Weather / best time / season intent
  if (has(lower, 'weather', 'best time', 'when to', 'season', 'climate', 'rain', 'sun', 'hot', 'cold', 'warm')) {
    const dest = findDestinationInText(lower);
    if (dest) {
      return {
        response: getWeatherAdvice(dest),
        intent: 'weather',
        matchedDestination: dest.slug,
      };
    }
    return {
      response:
        'The best time depends on where you are going. Bali is best April to October (dry season), Santorini June to September, Kyoto March-May for cherry blossoms or October-November for autumn colors, Patagonia November to March, Marrakech October to April, and Iceland June to August for midnight sun or September to March for Northern Lights. Which destination are you considering?',
      intent: 'weather',
    };
  }

  // 6. Destination search / recommendation intent
  if (
    has(
      lower,
      'recommend',
      'suggest',
      'where should',
      'find',
      'search',
      'looking for',
      'want to',
      'like to go',
      'trip to',
      'travel to',
      'visit',
      'vacation',
      'holiday',
      'honeymoon',
      'adventure',
      'beach',
      'culture',
      'hiking',
      'nature',
      'food',
      'romance',
      'family',
    )
  ) {
    return recommendDestination(lower);
  }

  // 7. Specific destination mentioned — give overview
  const dest = findDestinationInText(lower);
  if (dest) {
    return {
      response: `${dest.name} — ${dest.tagline}. ${dest.description} Our trips there start at $${dest.price_from} per person for ${dest.duration_days} days, with a ${dest.rating}-star rating from past travelers. Highlights include ${dest.highlights.slice(0, 3).join(', ')}, and more. Would you like to see the itinerary or check availability?`,
      intent: 'destination_info',
      matchedDestination: dest.slug,
    };
  }

  // 8. Help / capabilities
  if (has(lower, 'help', 'what can you', 'what do you do', 'who are you')) {
    return {
      response:
        "I'm your Wanderlust travel assistant. I can help you discover destinations, compare tour packages, check prices and itineraries, find the best time to travel, and start a booking. Just ask me something like 'I want a beach vacation' or 'Tell me about Kyoto' or 'How much is Iceland?'",
      intent: 'help',
    };
  }

  // 9. Fallback
  return {
    response:
      "I can help you find destinations, compare tours, check prices, plan itineraries, or start a booking. Try asking something like 'Recommend a beach destination', 'How much is the Bali trip?', or 'What is the itinerary for Kyoto?'",
    intent: 'fallback',
  };
}

function findDestinationInText(text: string): Destination | undefined {
  return DESTINATIONS.find(
    (d) =>
      text.includes(d.slug) ||
      text.includes(d.name.toLowerCase()) ||
      text.includes(d.country.toLowerCase().split(' ')[0]),
  );
}

function recommendDestination(lower: string): VoiceResult {
  // Match by travel style tags
  const styleMap: Record<string, string[]> = {
    beach: ['Beach', 'Romance'],
    adventure: ['Adventure', 'Hiking', 'Nature'],
    culture: ['Culture', 'Food'],
    hiking: ['Hiking', 'Adventure', 'Nature'],
    nature: ['Nature', 'Wildlife', 'Adventure'],
    food: ['Food', 'Culture'],
    romance: ['Romance', 'Beach'],
    honeymoon: ['Romance', 'Beach'],
    wellness: ['Wellness'],
    desert: ['Desert', 'Adventure'],
    wildlife: ['Wildlife', 'Nature'],
    city: ['City', 'Culture', 'Food'],
    'road trip': ['Road Trip', 'Adventure'],
  };

  for (const [keyword, tags] of Object.entries(styleMap)) {
    if (lower.includes(keyword)) {
      const matches = DESTINATIONS.filter((d) =>
        d.tags.some((t) => tags.includes(t)),
      );
      if (matches.length > 0) {
        const top = matches[0];
        const others = matches.slice(1, 3).map((d) => d.name);
        const otherText =
          others.length > 0
            ? ` If you want options, I also recommend ${others.join(' and ')}.`
            : '';
        return {
          response: `Based on your interest in ${keyword}, I recommend ${top.name} — ${top.tagline.toLowerCase()}. Trips start at $${top.price_from} for ${top.duration_days} days.${otherText} Would you like to see the full itinerary?`,
          intent: 'recommendation',
          matchedDestination: top.slug,
        };
      }
    }
  }

  // Budget-based recommendation
  const budgetMatch = lower.match(/\$?(\d{3,5})/);
  if (budgetMatch) {
    const budget = parseInt(budgetMatch[1]);
    const affordable = DESTINATIONS.filter(
      (d) => d.price_from <= budget,
    ).sort((a, b) => b.price_from - a.price_from);
    if (affordable.length > 0) {
      const top = affordable[0];
      return {
        response: `With a budget of around $${budget}, I recommend ${top.name} at $${top.price_from} per person — ${top.tagline.toLowerCase()}. You could also consider ${affordable
          .slice(1, 3)
          .map((d) => `${d.name} ($${d.price_from})`)
          .join(' or ')}. Want to see what is included?`,
        intent: 'recommendation',
        matchedDestination: top.slug,
      };
    }
  }

  // Default: recommend the top-rated
  const topRated = [...DESTINATIONS].sort((a, b) => b.rating - a.rating)[0];
  return {
    response: `I would recommend ${topRated.name} — ${topRated.tagline.toLowerCase()}. It is our highest-rated destination at ${topRated.rating} stars, with trips from $${topRated.price_from}. We also have great options in Bali, Santorini, Kyoto, Patagonia, Marrakech, and Iceland. What kind of experience are you looking for — beach, adventure, culture, or food?`,
    intent: 'recommendation',
    matchedDestination: topRated.slug,
  };
}

function getWeatherAdvice(dest: Destination): string {
  const advice: Record<string, string> = {
    bali: 'The best time to visit Bali is April to October during the dry season, with temperatures around 80 to 90 degrees Fahrenheit. Avoid January and February when it rains most. May and June are ideal — fewer crowds and great weather.',
    santorini:
      'The best time for Santorini is June to September, with warm sunny days around 80 degrees and almost no rain. July and August are busiest and most expensive. September is the sweet spot — still warm, fewer crowds, and lower prices.',
    kyoto: 'The best times for Kyoto are late March to early May for cherry blossoms, and October to November for autumn foliage. Summer is hot and humid (90 plus degrees). Winter is quiet and beautiful with occasional snow on the temples.',
    patagonia:
      'The Patagonian summer is November to March, with long daylight hours and temperatures around 50 to 65 degrees. Wind can be fierce year-round. Book the W trek well in advance for December to February — the trails fill up.',
    marrakech:
      'October to April is ideal for Marrakech, with daytime temperatures of 65 to 80 degrees. Summer is extremely hot, often over 100 degrees. March and April bring blooming gardens and perfect desert nights.',
    iceland: 'June to August gives you midnight sun and the warmest weather (50 to 60 degrees). For Northern Lights, visit September to March. Weather changes fast year-round — always pack layers and a waterproof jacket.',
  };
  return (
    advice[dest.slug] ??
    `The best time to visit ${dest.name} depends on what you want to do. Would you like me to look up the seasonal details?`
  );
}
