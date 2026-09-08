insert into survey_rec (rec_id, suggestion) values
  (1, 'Ask attendees to turn their cameras off during virtual meetings.'),
  (2, 'Designate one full day per week as meeting-free.'),
  (3, 'Use strict time limits for each person''s speaking turns.'),
  (4, 'Begin virtual meetings with personal check-in time, where each participant shares something non work-related to build rapport.'),
  (5, 'Allow an AI assistant to interrupt the meeting when it detects an unresolved disagreement or unanswered question.'),
  (6, 'Record every virtual meeting and make the recording available to anyone in the company.'),
  (7, 'Have the most junior participant speak first when the group is making a decision.'),
  (8, 'Limit virtual meetings to three participants unless the organizer provides a reason for including more people.'),
  (9, 'Require every attendee to speak at least once during the meeting.'),
  (10, 'Designate roles before the meeting starts (e.g., notetaker, chat facilitator, devil''s advocate, etc.).')
on conflict (rec_id) do update set suggestion = excluded.suggestion;
