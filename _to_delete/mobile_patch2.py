import sys, os
ROOT=sys.argv[1]; F='src/features/organizer/'
def edit(rel, old=None, new=None, append=None):
    p=os.path.join(ROOT,rel); s=open(p).read()
    if old is not None:
        assert old in s,(rel,old[:50]); s=s.replace(old,new,1)
    if append and append.strip() not in s: s=s.rstrip('\n')+'\n\n'+append.strip('\n')+'\n'
    open(p,'w').write(s)
edit(F+'events/styles.module.css', old='@media (max-width: 900px) { .container { padding: 0 20px; } }\n', new='')
for rel in ['subvendors/styles.module.css','earnings/styles.module.css']:
    edit(F+rel, append='@media (max-width: 560px) {\n  .row.headRow { display: none; }\n}')
edit(F+'coupons/styles.module.css', append='''@media (max-width: 560px) {
  .row, .usageRow { padding: 14px 16px; }
  .row > :nth-child(1) { grid-row: 1; }
  .row > :nth-child(6) { grid-row: 1; align-self: start; }
  .row > :nth-child(2) { grid-row: 2; }
  .row > :nth-child(3), .row > :nth-child(4), .row > :nth-child(5) { grid-row: 3; }
  .row > :nth-child(7) { grid-row: 4; }
  .row.rowHead, .usageRow.rowHead { display: none; }
}''')
edit(F+'public-events/styles.module.css', append='''/* The shell's back chevron already leads to the list. */
.backLink { display: none; }
.coverBlank { background: var(--evah-grad-soft, #f3f4f6); }''')
print('ok')
