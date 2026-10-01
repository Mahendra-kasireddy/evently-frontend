import { formatMoney } from '../constants';
import type { EventDashboard } from '../types';
import s from '../styles.module.css';

/**
 * The event's numbers.
 *
 * Every one of them is counted on the server from the tickets and bookings
 * themselves — none is a running total kept on the event, because a counter
 * incremented in one place and read in five eventually disagrees with the
 * tickets it claims to describe.
 */
export function DashboardTiles({ data }: { data: EventDashboard }) {
  const tiles = [
    { key: 'sold', label: 'Tickets sold', value: String(data.ticketsSold), tone: s.toneSold },
    { key: 'left', label: 'Remaining', value: String(data.ticketsRemaining), tone: s.toneLeft },
    { key: 'bookings', label: 'Bookings', value: String(data.bookings), tone: s.toneBookings },
    { key: 'revenue', label: 'Revenue', value: formatMoney(data.revenue), tone: s.toneRevenue },
    { key: 'in', label: 'Checked in', value: String(data.checkedIn), tone: s.toneIn },
    { key: 'due', label: 'Yet to arrive', value: String(data.pendingEntry), tone: s.toneDue },
  ];

  return (
    <>
      <ul className={s.tiles}>
        {tiles.map((tile) => (
          <li key={tile.key} className={`${s.tile} ${tile.tone}`}>
            <span className={s.tileValue}>{tile.value}</span>
            <span className={s.tileLabel}>{tile.label}</span>
          </li>
        ))}
      </ul>

      {/* Revenue is what actually arrived: a booking still waiting on the
          gateway is a seat held, not money earned. */}
      <p className={s.hint}>
        Revenue counts confirmed, paid bookings only — a booking still awaiting payment is a held
        seat, not income.
      </p>

      {data.byTicketType.length > 0 ? (
        <table className={s.table}>
          <caption className={s.tableCaption}>Where the sales came from</caption>
          <thead>
            <tr>
              <th scope="col">Ticket type</th>
              <th scope="col">Price</th>
              <th scope="col">Sold</th>
              <th scope="col">Left</th>
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.byTicketType.map((row) => (
              <tr key={row.id}>
                <td>{row.name}</td>
                <td>{formatMoney(row.price)}</td>
                <td>{row.sold}</td>
                <td>{row.remaining}</td>
                <td>{row.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </>
  );
}

export default DashboardTiles;
