const LEVELS: Record<string, 0 | 1 | 2 | 3 | 4> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

export type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};

export type Contributions = {
  total: number;
  weeks: ContributionDay[][];
};

const QUERY = `query {
  user(login: "AmoabaKelvin") {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}`;

export async function getContributions(): Promise<Contributions | null> {
  const token = process.env.GITHUB_PAT;
  if (!token) return null;

  try {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: QUERY }),
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const json = await res.json();
    const calendar =
      json.data?.user?.contributionsCollection?.contributionCalendar;
    if (!calendar) return null;

    return {
      total: calendar.totalContributions,
      weeks: calendar.weeks.map(
        (week: {
          contributionDays: {
            date: string;
            contributionCount: number;
            contributionLevel: string;
          }[];
        }) =>
          week.contributionDays.map((day) => ({
            date: day.date,
            count: day.contributionCount,
            level: LEVELS[day.contributionLevel] ?? 0,
          }))
      ),
    };
  } catch {
    return null;
  }
}
