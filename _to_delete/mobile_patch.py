import sys, os
ROOT = sys.argv[1]
def edit(rel, old=None, new=None, append=None):
    p = os.path.join(ROOT, rel); s = open(p).read()
    if old is not None:
        assert old in s, (rel, old[:60]); s = s.replace(old, new, 1)
    if append and append.strip() not in s:
        s = s.rstrip('\n') + '\n\n' + append.strip('\n') + '\n'
    open(p, 'w').write(s)

F = 'src/features/organizer/'
# --- shared filter pills scroll sideways on a phone instead of wrapping
edit('src/shared/partner/partner.module.css', append='''/* A phone: filter pills form one row that scrolls, rather than wrapping into
   a block of buttons two or three rows deep. */
@media (max-width: 560px) {
  .pills {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
    margin: 0 -14px;
    padding: 2px 14px;
  }
  .pills::-webkit-scrollbar { display: none; }
}''')

# --- home: pending enquiries stack their button under the row
edit(F+'home/styles.module.css', append='''@media (max-width: 560px) {
  .enqRow { flex-wrap: wrap; row-gap: 10px; }
  .enqWho { flex: 1 1 calc(100% - 110px); }
  .enqRow > a:last-child { flex: 1 0 100%; justify-content: center; }
}''')

# --- enquiry card: time + status as a top strip, actions share the width
edit(F+'quotes/sections/RequestCard/RequestCard.module.css', append='''@media (max-width: 560px) {
  .head { flex-wrap: wrap; gap: 12px; }
  .side {
    order: -1;
    flex: 1 0 100%;
    flex-direction: row-reverse;
    justify-content: space-between;
    align-items: center;
  }
  .foot { flex-wrap: wrap; }
  .spacer { display: none; }
  .quoteTotal { flex: 1 0 100%; }
  .foot > a:last-child { flex: 1 1 auto; justify-content: center; }
}''')

# --- quote builder card: status chip under the name, not squeezing it
edit(F+'quote-builder/sections/JobCard/JobCard.module.css', append='''@media (max-width: 560px) {
  .head { flex-wrap: wrap; row-gap: 8px; }
  .headText { flex: 1 1 calc(100% - 52px); }
  .head > :last-child { margin-left: 52px; }
}''')

# --- active events / profile: the shell already gives the gutter
for rel in ['events/styles.module.css', 'profile/styles.module.css']:
    edit(F+rel, old='.page { min-height: 100vh; background: var(--color-bg); padding: 22px 0 48px; }',
         new='.page { padding: 0 0 24px; }')
    edit(F+rel, old='margin: 0 auto; padding: 0 44px;', new='margin: 0 auto; padding: 0;')
edit(F+'events/styles.module.css', append='''@media (max-width: 560px) {
  .container { gap: 22px; }
  .heading { font-size: 1.25rem; }
}''')
edit(F+'profile/styles.module.css', old='@media (max-width: 1000px) { .container { flex-direction: column; padding: 0 20px; } }',
     new='@media (max-width: 1000px) { .container { flex-direction: column-reverse; align-items: stretch; } }')
edit(F+'profile/sections/LivePreview.module.css', old='.body { padding: 0 16px 16px; margin-top: -28px; }',
     new='.body { position: relative; padding: 0 16px 16px; margin-top: -28px; }')
edit(F+'profile/sections/LivePreview.module.css', append='@media (max-width: 1000px) { .wrap { width: 100%; } }')

# --- event detail: accept / decline share the row
edit(F+'event-detail/styles.module.css', append='''@media (max-width: 560px) {
  .header { padding: 14px 16px; }
  .confirmActions > * { flex: 1 1 auto; justify-content: center; }
}''')

# --- calendar: a dot instead of the word in a phone-sized cell
edit(F+'calendar/styles.module.css', append='''@media (max-width: 560px) {
  .day { aspect-ratio: 1; padding: 5px; }
  .dayTag {
    font-size: 0;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    margin: auto auto 2px;
  }
}''')

# --- public events: filters and workspace tabs scroll; shorter covers
edit(F+'public-events/styles.module.css', append='''@media (max-width: 560px) {
  .filters,
  .tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .filters::-webkit-scrollbar,
  .tabs::-webkit-scrollbar { display: none; }
  .filter,
  .tab { flex: none; white-space: nowrap; }
  .cover { aspect-ratio: 21 / 9; }
  .toolbarRight { width: 100%; }
  .toolbarRight > :first-child { flex: 1 1 auto; min-width: 0; }
  .headActions > * { flex: 1 1 auto; }
}''')

# --- academy: ring above the copy, stage header wraps, helpline stacks
edit(F+'academy/styles.module.css', append='''@media (max-width: 560px) {
  .hero { flex-direction: column; align-items: flex-start; gap: 14px; padding: 20px; }
  .heroRing { order: -1; margin-left: 0; }
  .heroTitle { font-size: 21px; }
  .stageHead { flex-wrap: wrap; row-gap: 4px; }
  .stageCount { margin-left: 0; flex: 1 0 100%; }
  .helpline { flex-wrap: wrap; }
  .helplineCta { margin-left: 0; flex: 1 0 100%; justify-content: center; }
}''')

# --- the three ledgers become stacked cards on a phone
edit(F+'earnings/styles.module.css', append='''/* A phone: each transaction is a small card — booking and payout on top,
   customer and net under it, date and gross last. */
@media (max-width: 560px) {
  .table { min-width: 0; }
  .headRow { display: none; }
  .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
    padding: 14px 16px;
  }
  .cRef { grid-column: 1; grid-row: 1; }
  .cPay { grid-column: 2; grid-row: 1; justify-self: end; }
  .cCust { grid-column: 1; grid-row: 2; }
  .cNet { grid-column: 2; grid-row: 2; justify-self: end; }
  .cDate { grid-column: 1; grid-row: 3; font-size: 12px; }
  .cAmt { grid-column: 2; grid-row: 3; justify-self: end; font-size: 12px; color: var(--c-muted); }
  .cAmt::before { content: 'Gross '; }
  .cComm { display: none; }
}''')
edit(F+'coupons/styles.module.css', append='''/* A phone: coupons and redemptions as stacked cards, not a sideways table. */
@media (max-width: 560px) {
  .scroller > * { min-width: 0; }
  .rowHead { display: none; }
  .row {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px 10px;
    padding: 14px 2px;
  }
  .row > :nth-child(1) { grid-column: 1 / 3; }
  .row > :nth-child(6) { grid-column: 3; justify-self: end; }
  .row > :nth-child(2) { grid-column: 1 / 4; font-weight: 600; color: var(--c-navy); }
  .row > :nth-child(3)::before,
  .row > :nth-child(4)::before,
  .row > :nth-child(5)::before {
    display: block;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--c-muted);
  }
  .row > :nth-child(3)::before { content: 'Minimum'; }
  .row > :nth-child(4)::before { content: 'Used'; }
  .row > :nth-child(5)::before { content: 'Ends'; }
  .row > :nth-child(7) { grid-column: 1 / 4; }
  .row > :nth-child(7) > * { width: 100%; justify-content: center; }
  .usageRow {
    grid-template-columns: 1fr auto;
    gap: 4px 12px;
    padding: 14px 2px;
  }
  .usageRow > :nth-child(1) { grid-column: 1; grid-row: 1; font-weight: 600; }
  .usageRow > :nth-child(6) { grid-column: 2; grid-row: 1; justify-self: end; font-weight: 700; }
  .usageRow > :nth-child(2) { grid-column: 1; grid-row: 2; color: var(--c-muted); font-size: 12.5px; }
  .usageRow > :nth-child(5) { grid-column: 2; grid-row: 2; justify-self: end; color: var(--c-teal); font-size: 12.5px; }
  .usageRow > :nth-child(3) { grid-column: 1; grid-row: 3; font-size: 12.5px; }
  .usageRow > :nth-child(7) { grid-column: 2; grid-row: 3; justify-self: end; color: var(--c-muted); font-size: 12px; }
  .usageRow > :nth-child(4) { display: none; }
}''')
edit(F+'subvendors/styles.module.css', append='''/* A phone: each sub-vendor is a card — who, status and actions on top, the
   rest as a short line of facts and the performance bar under it. */
@media (max-width: 560px) {
  .table { min-width: 0; }
  .headRow { display: none; }
  .row {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 8px 10px;
    padding: 14px 16px;
  }
  .cName { grid-column: 1; grid-row: 1; }
  .cStatus { grid-column: 2; grid-row: 1; }
  .cActions { grid-column: 3; grid-row: 1; width: auto; }
  .cCat { grid-column: 1 / 2; grid-row: 2; padding-left: 44px; color: var(--c-muted); }
  .cArea { grid-column: 2 / 4; grid-row: 2; justify-self: end; }
  .cRate { grid-column: 1 / 2; grid-row: 3; padding-left: 44px; }
  .cEvents { grid-column: 2 / 4; grid-row: 3; justify-self: end; }
  .cEvents::after { content: ' events'; color: var(--c-muted); }
  .cPerf { grid-column: 1 / 4; grid-row: 4; padding-left: 44px; }
}''')

# --- shell: short tab labels on a phone; the accent wash some screens read
edit('src/app/OrganizerLayout.module.css', old="  --accent: #e23d7a;\n", new="  --accent: #e23d7a;\n  --accent-soft: #fdeaf2;\n")
edit('src/app/OrganizerLayout.module.css', append='''/* The full tab name on wide screens, the short one on a phone. */
.tabShort { display: none; }
@media (max-width: 560px) {
  .tabLong { display: none; }
  .tabShort { display: inline; }
}''')
print('ok')
