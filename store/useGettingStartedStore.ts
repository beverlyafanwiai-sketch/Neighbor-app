import { create } from 'zustand';

// Tracks actions taken *this session* — not derived from existing content,
// since the seed data already gives ME posts, joined circles, and RSVPs
// from the start. These flags only flip when the corresponding action is
// actually taken, so the checklist genuinely starts incomplete.
type GettingStartedState = {
  postedThisSession: boolean;
  joinedCircleThisSession: boolean;
  rsvpedThisSession: boolean;
  savedThisSession: boolean;
  dismissed: boolean;
  markPosted: () => void;
  markJoinedCircle: () => void;
  markRsvped: () => void;
  markSaved: () => void;
  dismiss: () => void;
};

export const useGettingStartedStore = create<GettingStartedState>((set) => ({
  postedThisSession: false,
  joinedCircleThisSession: false,
  rsvpedThisSession: false,
  savedThisSession: false,
  dismissed: false,

  markPosted: () => set({ postedThisSession: true }),
  markJoinedCircle: () => set({ joinedCircleThisSession: true }),
  markRsvped: () => set({ rsvpedThisSession: true }),
  markSaved: () => set({ savedThisSession: true }),
  dismiss: () => set({ dismissed: true }),
}));
