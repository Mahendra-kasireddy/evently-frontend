import { useState, type FormEvent } from 'react';
import { TICKET_STATUS_LABEL, formatMoney, fromLocalInput, toLocalInput } from '../constants';
import type { TicketType, TicketTypeInput } from '../types';
import s from '../styles.module.css';

interface TicketTypesProps {
  types: TicketType[];
  busy: boolean;
  error: string | null;
  canEdit: boolean;
  onCreate: (body: TicketTypeInput) => Promise<unknown>;
  onUpdate: (typeId: string, body: Partial<TicketTypeInput>) => Promise<unknown>;
  onArchive: (typeId: string) => Promise<unknown>;
}

/**
 * The event's ticket types.
 *
 * Stock is the server's: this screen shows what is left and lets the organizer
 * change the total, and the server works out the difference. Raising the total
 * by ten adds ten seats — it does not reset what is available back to the
 * total, which would hand back every ticket already sold.
 */
export function TicketTypes({
  types,
  busy,
  error,
  canEdit,
  onCreate,
  onUpdate,
  onArchive,
}: TicketTypesProps) {
  const [editing, setEditing] = useState<TicketType | null>(null);
  const [adding, setAdding] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (name: string) => String(data.get(name) ?? '').trim();

    const body: TicketTypeInput = {
      name: text('name'),
      description: text('description'),
      price: Number(text('price') || 0),
      totalQuantity: Number(text('totalQuantity') || 0),
      maxPerCustomer: Number(text('maxPerCustomer') || 0),
      status: (text('status') as TicketTypeInput['status']) || 'active',
      salesStart: fromLocalInput(text('salesStart')),
      salesEnd: fromLocalInput(text('salesEnd')),
    };

    if (editing) await onUpdate(editing.id, body);
    else await onCreate(body);
    setEditing(null);
    setAdding(false);
  };

  const form = (type: TicketType | null) => (
    <form className={s.inlineForm} onSubmit={submit}>
      <div className={s.row}>
        <label className={s.field}>
          <span className={s.label}>Name</span>
          <input className={s.input} name="name" defaultValue={type?.name ?? ''} required />
        </label>
        <label className={s.field}>
          <span className={s.label}>Price (₹)</span>
          <input
            className={s.input}
            type="number"
            min={0}
            name="price"
            defaultValue={type?.price ?? 0}
            required
          />
          <span className={s.hint}>0 makes it a free ticket.</span>
        </label>
        <label className={s.field}>
          <span className={s.label}>Quantity</span>
          <input
            className={s.input}
            type="number"
            min={type ? type.sold : 0}
            name="totalQuantity"
            defaultValue={type?.totalQuantity ?? 0}
            required
          />
          {type && type.sold > 0 ? (
            <span className={s.hint}>{type.sold} already sold, so it cannot go lower.</span>
          ) : null}
        </label>
      </div>

      <label className={s.field}>
        <span className={s.label}>Description</span>
        <input
          className={s.input}
          name="description"
          defaultValue={type?.description ?? ''}
          maxLength={500}
          placeholder="What this ticket includes"
        />
      </label>

      <div className={s.row}>
        <label className={s.field}>
          <span className={s.label}>Sales open</span>
          <input
            className={s.input}
            type="datetime-local"
            name="salesStart"
            defaultValue={toLocalInput(type?.salesStart)}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Sales close</span>
          <input
            className={s.input}
            type="datetime-local"
            name="salesEnd"
            defaultValue={toLocalInput(type?.salesEnd)}
          />
        </label>
        <label className={s.field}>
          <span className={s.label}>Max per customer</span>
          <input
            className={s.input}
            type="number"
            min={0}
            name="maxPerCustomer"
            defaultValue={type?.maxPerCustomer ?? 0}
          />
          <span className={s.hint}>0 means no ceiling of its own.</span>
        </label>
        <label className={s.field}>
          <span className={s.label}>Status</span>
          <select className={s.input} name="status" defaultValue={type?.status ?? 'active'}>
            <option value="active">On sale</option>
            <option value="paused">Paused</option>
          </select>
        </label>
      </div>

      {error ? <p className={s.error}>{error}</p> : null}

      <div className={s.formActions}>
        <button
          type="button"
          className={s.ghostBtn}
          onClick={() => {
            setEditing(null);
            setAdding(false);
          }}
        >
          Cancel
        </button>
        <button type="submit" className={s.primaryBtn} disabled={busy}>
          {busy ? 'Saving…' : type ? 'Save ticket type' : 'Add ticket type'}
        </button>
      </div>
    </form>
  );

  return (
    <div className={s.panel}>
      {types.length === 0 && !adding ? (
        <p className={s.hint}>
          No ticket types yet. An event needs at least one before it can be published.
        </p>
      ) : null}

      {types.length > 0 ? (
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Type</th>
              <th scope="col">Price</th>
              <th scope="col">Sold</th>
              <th scope="col">Left</th>
              <th scope="col">Status</th>
              {canEdit ? <th scope="col">
                <span className={s.srOnly}>Actions</span>
              </th> : null}
            </tr>
          </thead>
          <tbody>
            {types.map((type) => (
              <tr key={type.id}>
                <td>
                  <strong>{type.name}</strong>
                  {type.description ? <div className={s.cellHint}>{type.description}</div> : null}
                </td>
                <td>{formatMoney(type.price)}</td>
                <td>{type.sold}</td>
                <td>{type.availableQuantity}</td>
                <td>
                  <span className={type.onSale ? s.pillOn : s.pillOff}>
                    {/* Four separate reasons a type may not be buyable, so the
                        word here is "on sale" rather than the stored status. */}
                    {type.onSale ? 'On sale' : TICKET_STATUS_LABEL[type.status]}
                  </span>
                </td>
                {canEdit ? (
                  <td className={s.rowActions}>
                    <button
                      type="button"
                      className={s.linkBtn}
                      onClick={() => {
                        setAdding(false);
                        setEditing(type);
                      }}
                    >
                      Edit
                    </button>
                    {/* Removing is refused by the server once anybody holds one:
                        a ticket whose type has vanished is one nobody at the
                        door can explain. */}
                    <button
                      type="button"
                      className={s.linkBtn}
                      onClick={() => void onArchive(type.id)}
                      disabled={type.sold > 0}
                      title={type.sold > 0 ? 'Tickets of this type have been sold' : undefined}
                    >
                      Remove
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {editing ? form(editing) : null}
      {adding ? form(null) : null}

      {canEdit && !adding && !editing ? (
        <button type="button" className={s.primaryBtn} onClick={() => setAdding(true)}>
          Add ticket type
        </button>
      ) : null}
    </div>
  );
}

export default TicketTypes;
