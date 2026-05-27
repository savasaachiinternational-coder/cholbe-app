export type ChatMessage = {
  id: string;
  type: 'incoming' | 'outgoing';
  text: string;
  timestamp: string;
};

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    type: 'incoming',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
  {
    id: '2',
    type: 'outgoing',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
  {
    id: '3',
    type: 'incoming',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
  {
    id: '4',
    type: 'outgoing',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
  {
    id: '5',
    type: 'outgoing',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
  {
    id: '6',
    type: 'incoming',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    timestamp: '14/01 13:55',
  },
];
