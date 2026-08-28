export const TASKS_COPY = {
  title: 'Tasks',
  upcomingTitle: 'Waiting on your answer',
  upcomingEmpty: 'No new assignments right now.',
  activeTitle: 'Active tasks',
  activeEmpty: 'Nothing in progress right now.',
  /*
   * Finished work used to disappear from this screen entirely — only a count
   * survived, in a footer. A vendor could not check what they had delivered,
   * or which job a payment referred to.
   */
  doneTitle: 'Recently completed',
  doneEmpty: 'Completed tasks will appear here.',
  respondBy: (dueDate: string) => `Respond by ${dueDate}`,
};

/** How many finished tasks Home shows before deferring to Payments. */
export const RECENT_DONE_LIMIT = 5;
