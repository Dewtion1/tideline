import { epochDays, type ISODate } from "./dates.js";

export type Precept = {
  n: number;
  title: string;
  prompt: string;
  suggestions: [string, string, string];
};

/**
 * 21 titles from The Way to Happiness, in booklet order.
 * Prompt and suggestions are original text written for Tideline.
 * Do not add booklet body copy here — titles only, plus original application.
 */
export const PRECEPTS: readonly Precept[] = [
  {
    n: 1,
    title: "Take Care of Yourself",
    prompt: "Where did the body ask for care today, and did you answer it.",
    suggestions: [
      "Keep the same lights-out time for the next three nights.",
      "Eat one meal sitting down, plate on a table, screen in another room.",
      "Walk ten minutes at midday without headphones.",
    ],
  },
  {
    n: 2,
    title: "Be Temperate",
    prompt: "What did you take past the point of use today.",
    suggestions: [
      "Decide the last drink, last scroll, or last serving before you start.",
      "Leave a gap of one hour between the urge and the act; note what fills it.",
      "Serve a measured portion and put the rest away before you sit down.",
    ],
  },
  {
    n: 3,
    title: "Don't Be Promiscuous",
    prompt: "Did closeness today match the weight you actually give the person.",
    suggestions: [
      "Name the relationship you are in, in one sentence, before you act on it.",
      "If a message would be hard to stand by in daylight, do not send it.",
      "Spend the evening with someone you already owe time, not a new chase.",
    ],
  },
  {
    n: 4,
    title: "Love and Help Children",
    prompt: "Which child (yours or not) was within reach of a useful hour.",
    suggestions: [
      "Give one stretch of undivided attention — no phone in the room.",
      "Teach a small practical skill rather than buying a distraction.",
      "Ask one real question and wait for the answer.",
    ],
  },
  {
    n: 5,
    title: "Honor and Help Your Parents",
    prompt: "What would count as help to a parent or elder this week, not later.",
    suggestions: [
      "Make the call you have been postponing; keep it to twenty minutes.",
      "Handle one errand they have been carrying alone.",
      "Write down a fact of their life you do not want to lose.",
    ],
  },
  {
    n: 6,
    title: "Set A Good Example",
    prompt: "Who was watching, and what did they actually see you do.",
    suggestions: [
      "Do the unglamorous task in view rather than the impressive one in private.",
      "Keep one visible promise today, on time.",
      "Speak about a person the way you would if they were in the doorway.",
    ],
  },
  {
    n: 7,
    title: "Seek To Live With The Truth",
    prompt: "Where did you shade, omit, or decorate a fact today.",
    suggestions: [
      "Correct one small inaccuracy you let stand, in writing if needed.",
      "Before you explain a miss, state the miss in a single plain sentence.",
      "If you do not know, say you do not know.",
    ],
  },
  {
    n: 8,
    title: "Do Not Murder",
    prompt: "Where did contempt or rage get a foothold, even in small form.",
    suggestions: [
      "Step away from a fight you cannot finish without harm.",
      "Do not rehearse revenge; write the grievance once and close the page.",
      "If you handle tools, traffic, or medicine, treat them as live.",
    ],
  },
  {
    n: 9,
    title: "Don't Do Anything Illegal",
    prompt: "What rule did you treat as optional because no one was looking.",
    suggestions: [
      "Finish the form, licence, or payment you have been skating past.",
      "If a shortcut needs a lie to hold, drop the shortcut.",
      "Ask whether you would sign the act with your name on it.",
    ],
  },
  {
    n: 10,
    title: "Support A Government Designed and Run For All The People",
    prompt: "What civic duty did you leave to someone else this month.",
    suggestions: [
      "Read one local notice or agenda that actually affects your street.",
      "Show up for a vote, a meeting, or a neighbour's practical need.",
      "Speak of office-holders as public servants, not as a sport.",
    ],
  },
  {
    n: 11,
    title: "Do Not Harm A Person Of Good Will",
    prompt: "Who offered good will today, and did you meet it or tax it.",
    suggestions: [
      "Do not dump a mood on the person who least deserves it.",
      "If someone helped you, close the loop with a specific thanks.",
      "Leave a coworker or neighbour better than you found them this afternoon.",
    ],
  },
  {
    n: 12,
    title: "Safeguard And Improve Your Environment",
    prompt: "What in the room, street, or inbox is worse because you left it.",
    suggestions: [
      "Clear one surface you walk past every day.",
      "Put the phone to charge outside the bedroom tonight.",
      "Mend or bin one broken thing instead of stepping over it.",
    ],
  },
  {
    n: 13,
    title: "Do Not Steal",
    prompt: "What time, credit, or thing did you take without a clean claim.",
    suggestions: [
      "Return what is not yours, including a borrowed hour on someone else's clock.",
      "Pay the invoice or split the bill without being chased.",
      "If you used another person's work, name them.",
    ],
  },
  {
    n: 14,
    title: "Be Worthy of Trust",
    prompt: "Which promise is currently leaking, even a small one.",
    suggestions: [
      "Bring one overdue reply to zero today.",
      "Say no now rather than a yes you will not keep.",
      "Tell the person waiting for you the true time, not the hopeful one.",
    ],
  },
  {
    n: 15,
    title: "Fulfill Your Obligations",
    prompt: "What is owed, to whom, and by when — said without padding.",
    suggestions: [
      "Write the next undone obligation into Grow with a date.",
      "Do the smallest concrete step on the heaviest outstanding item.",
      "Tell the person you owe if the date has moved; do not let them discover it.",
    ],
  },
  {
    n: 16,
    title: "Be Industrious",
    prompt: "What useful work sat untouched while easier motion filled the day.",
    suggestions: [
      "Give the hardest task the first intact hour.",
      "Finish one started thing before opening a new one.",
      "Track screen minutes tonight and compare them to the work that moved.",
    ],
  },
  {
    n: 17,
    title: "Be Competent",
    prompt: "Where is the widest gap between what the work needs and what you can do.",
    suggestions: [
      "Rate one skill in Grow: have against need. Start with the largest gap.",
      "Practise the weak part for twenty focused minutes, not the part you already know.",
      "Ask one person who is better at it how they would begin.",
    ],
  },
  {
    n: 18,
    title: "Respect The Religious Beliefs of Others",
    prompt: "Did you treat another person's faith as a target, a joke, or a fact of theirs.",
    suggestions: [
      "Do not argue a belief you have not first restated fairly.",
      "Leave another person's practice room; it is not yours to manage.",
      "If you disagree, keep the disagreement off the person.",
    ],
  },
  {
    n: 19,
    title: "Try Not To Do Things To Others That You Would Not Like Them to Do To You",
    prompt: "Name one act today you would resent if the direction were reversed.",
    suggestions: [
      "Drop the remark you would not want said about you in the same room.",
      "Do not use someone's time the way you hate yours being used.",
      "Before you press send, read the message as if it were incoming.",
    ],
  },
  {
    n: 20,
    title: "Try To Treat Others As You Would Want Them To Treat You",
    prompt: "Who needed the standard you wish applied to yourself.",
    suggestions: [
      "Give the patience you keep asking for.",
      "Reach a person whose cadence has lapsed; the list is on Grow.",
      "Offer the plain courtesy you notice most when it is missing.",
    ],
  },
  {
    n: 21,
    title: "Flourish And Prosper",
    prompt: "What would a solvent, capable week actually look like from here.",
    suggestions: [
      "Check runway on Money; if the number is a countdown, name the leak.",
      "Record one win on Today that is a fact, not a mood.",
      "Put one hour into the competence gap rather than into more plans.",
    ],
  },
];

export function preceptIndexForDate(iso: ISODate): number {
  const i = epochDays(iso) % PRECEPTS.length;
  return i < 0 ? i + PRECEPTS.length : i;
}

export function preceptForDate(iso: ISODate): Precept {
  return PRECEPTS[preceptIndexForDate(iso)]!;
}
