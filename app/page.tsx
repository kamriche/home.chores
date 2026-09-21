"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleCheck,
  Home,
  House,
  Plus,
  Settings2,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type View = "chores" | "planning" | "people" | "home";
type Recurrence = "One-off" | "Daily" | "Weekly" | "Monthly";
type Person = { id: number; name: string; role: "Family member" | "Roommate" };
type Room = { id: number; name: string; type: string; floor: number };
type Chore = {
  id: number;
  name: string;
  roomId: number;
  personId: number;
  time: string;
  startTime: string;
  frequency: Recurrence;
  tools: string[];
  scheduled: string;
  done: boolean;
  doneOn?: string;
  completedDates?: string[];
};
type SharedSpace = {
  id: number;
  name: string;
  type: string;
  floors: number;
  basements: number;
  responsibleId: number;
  people: Person[];
  rooms: Room[];
  chores: Chore[];
};
type Notice = { id: number; title: string; detail: string; read: boolean };

const today = "2026-09-21";
const addDays = (value: string, days: number) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};
const shortDate = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
const floorLabel = (floor: number) => floor < 0 ? `B${Math.abs(floor)}` : floor === 1 ? "Ground floor" : `Floor ${floor}`;

const initialSpaces: SharedSpace[] = [
  {
    id: 1,
    name: "Maple House",
    type: "House",
    floors: 2,
    basements: 0,
    responsibleId: 1,
    people: [
      { id: 1, name: "Jamie", role: "Roommate" },
      { id: 2, name: "Alex", role: "Roommate" },
      { id: 3, name: "Sam", role: "Roommate" },
    ],
    rooms: [
      { id: 1, name: "Kitchen", type: "Kitchen", floor: 1 },
      { id: 2, name: "Living room", type: "Living room", floor: 1 },
      { id: 3, name: "Downstairs bathroom", type: "Bathroom", floor: 1 },
      { id: 4, name: "Jamie’s bedroom", type: "Bedroom", floor: 2 },
      { id: 5, name: "Alex’s bedroom", type: "Bedroom", floor: 2 },
      { id: 6, name: "Upstairs bathroom", type: "Bathroom", floor: 2 },
    ],
    chores: [
      { id: 1, name: "Wipe counters & stovetop", roomId: 1, personId: 1, time: "10 min", startTime: "08:00", frequency: "Daily", tools: ["Microfiber cloth", "Cleaning spray"], scheduled: today, done: false },
      { id: 2, name: "Vacuum the living room", roomId: 2, personId: 2, time: "20 min", startTime: "18:00", frequency: "Weekly", tools: ["Vacuum"], scheduled: addDays(today, 1), done: false },
      { id: 3, name: "Clean sink & mirror", roomId: 3, personId: 3, time: "15 min", startTime: "19:00", frequency: "Weekly", tools: ["Sponge", "Glass cleaner"], scheduled: addDays(today, 2), done: false },
      { id: 4, name: "Take out the recycling", roomId: 1, personId: 2, time: "5 min", startTime: "20:00", frequency: "Weekly", tools: ["Bin bags"], scheduled: addDays(today, -1), done: true, doneOn: addDays(today, -1), completedDates: [addDays(today, -1)] },
    ],
  },
  {
    id: 2,
    name: "City Apartment",
    type: "Apartment",
    floors: 1,
    basements: 0,
    responsibleId: 101,
    people: [
      { id: 101, name: "Jamie", role: "Family member" },
      { id: 102, name: "Morgan", role: "Roommate" },
    ],
    rooms: [
      { id: 101, name: "Kitchen", type: "Kitchen", floor: 1 },
      { id: 102, name: "Living room", type: "Living room", floor: 1 },
      { id: 103, name: "Main bedroom", type: "Bedroom", floor: 1 },
      { id: 104, name: "Bathroom", type: "Bathroom", floor: 1 },
    ],
    chores: [
      { id: 101, name: "Mop the kitchen floor", roomId: 101, personId: 102, time: "20 min", startTime: "17:30", frequency: "Weekly", tools: ["Mop", "Bucket"], scheduled: addDays(today, 2), done: false },
      { id: 102, name: "Clean the bathroom", roomId: 104, personId: 101, time: "30 min", startTime: "10:00", frequency: "Weekly", tools: ["Sponge", "Cleaning spray", "Gloves"], scheduled: addDays(today, 5), done: false },
    ],
  },
];

const navItems: { id: View; label: string; icon: typeof CircleCheck }[] = [
  { id: "chores", label: "Chores", icon: CircleCheck },
  { id: "planning", label: "Planning", icon: CalendarDays },
  { id: "people", label: "People", icon: Users },
  { id: "home", label: "Our home", icon: Home },
];

export default function HomeChoresPage() {
  const [spaces, setSpaces] = useState(initialSpaces);
  const [spaceId, setSpaceId] = useState(1);
  const [view, setView] = useState<View>("chores");
  const [dark, setDark] = useState(false);
  const [language, setLanguage] = useState("English");
  const [accountName, setAccountName] = useState("Jamie");
  const [profilePanel, setProfilePanel] = useState<"settings" | "accounts" | null>(null);
  const [houseMenu, setHouseMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mine, setMine] = useState(false);
  const [allPeople, setAllPeople] = useState(false);
  const [planningMode, setPlanningMode] = useState<"scheduled" | "completed">("scheduled");
  const [editor, setEditor] = useState<"chore" | "person" | "space" | null>(null);
  const [message, setMessage] = useState("");
  const [notices, setNotices] = useState<Notice[]>([
    { id: 1, title: "Vacuum the living room is due today", detail: "Alex · Living room · 20 min", read: false },
    { id: 2, title: "A chore was assigned to you", detail: "Wipe counters & stovetop · Today", read: false },
    { id: 3, title: "Alex completed the recycling", detail: "Completed earlier this week", read: true },
  ]);

  const space = spaces.find((item) => item.id === spaceId) ?? spaces[0];
  const currentUser = space.people.find((person) => person.name === accountName);
  const accountPeople = useMemo(() => {
    const people = new Map<string, Person>();
    spaces.forEach((item) => item.people.forEach((person) => people.set(person.name.toLowerCase(), person)));
    return [...people.values()];
  }, [spaces]);
  const responsible = space.people.find((person) => person.id === space.responsibleId) ?? space.people[0];
  const unread = notices.filter((notice) => !notice.read).length;

  const updateSpace = (updater: (current: SharedSpace) => SharedSpace) =>
    setSpaces((current) => current.map((item) => (item.id === spaceId ? updater(item) : item)));

  const notify = (title: string, detail: string) =>
    setNotices((current) => [{ id: Date.now(), title, detail, read: false }, ...current]);

  const setChore = (id: number, patch: Partial<Chore>) =>
    updateSpace((current) => ({
      ...current,
      chores: current.chores.map((chore) => (chore.id === id ? { ...chore, ...patch } : chore)),
    }));

  const deletePerson = (name: string, everywhere: boolean) => {
    setSpaces((current) => current.map((item) => {
      if (!everywhere && item.id !== spaceId) return item;
      const removed = item.people.find((person) => person.name === name);
      if (!removed) return item;
      const people = item.people.filter((person) => person.id !== removed.id);
      return {
        ...item,
        people,
        responsibleId: item.responsibleId === removed.id ? people[0]?.id ?? 0 : item.responsibleId,
        chores: item.chores.map((chore) => chore.personId === removed.id ? { ...chore, personId: 0 } : chore),
      };
    }));
    if (everywhere && accountName === name) setAccountName(accountPeople.find((person) => person.name !== name)?.name ?? "Guest");
    setMessage(everywhere ? `${name} removed from every shared space.` : `${name} removed from ${space.name}.`);
  };

  const deleteCurrentSpace = () => {
    const nextSpace = spaces.find((item) => item.id !== spaceId);
    if (!nextSpace) return;
    setSpaces((current) => current.filter((item) => item.id !== spaceId));
    setSpaceId(nextSpace.id);
    setMessage(`${space.name} deleted.`);
  };

  const openView = (next: View) => {
    setView(next);
    setEditor(null);
    setUserMenu(false);
    setHouseMenu(false);
    setProfilePanel(null);
    setMessage("");
  };

  return (
    <div id="hearth-demo" data-theme={dark ? "dark" : "light"}>
      <div className="hc-shell">
        <aside className="hc-side">
          <div className="hc-brand"><span className="hc-logo"><House size={18} /></span>Fresh Home</div>
          <div className="hc-house-wrap">
            <button className="hc-house" type="button" aria-expanded={houseMenu} onClick={() => setHouseMenu(!houseMenu)}>
              <span>
                <span className="hc-label">OUR SHARED SPACE</span>
                <strong>{space.name}</strong>
                <span className="hc-label">{space.people.length} people · {space.rooms.length} rooms · {space.floors} floor{space.floors === 1 ? "" : "s"}{space.basements ? ` · ${space.basements} basement${space.basements === 1 ? "" : "s"}` : ""}</span>
                <span className="hc-label" id="hc-house-owner">Responsible · {responsible?.name ?? "Not assigned"}</span>
              </span>
              <ChevronsUpDown size={16} />
            </button>
            {houseMenu && (
              <section className="hc-house-menu" aria-label="Shared spaces">
                <div className="hc-space-list">
                  {spaces.map((item) => {
                    const owner = item.people.find((person) => person.id === item.responsibleId);
                    return <button type="button" key={item.id} className="hc-space-option" aria-current={item.id === spaceId} onClick={() => { setSpaceId(item.id); setHouseMenu(false); setMessage(`Now viewing ${item.name}.`); }}>
                      <span className="hc-space-icon"><Home size={18} /></span>
                      <span><strong>{item.name}</strong><small>{item.type} · Responsible: {owner?.name ?? "Not assigned"}</small><small>{item.people.length} people · {item.rooms.length} rooms</small></span>
                    </button>;
                  })}
                </div>
                <button className="hc-button hc-create-space" type="button" onClick={() => { setEditor("space"); setHouseMenu(false); }}><Plus size={16} /> Create another shared space</button>
              </section>
            )}
          </div>
          <nav aria-label="Main navigation">
            {navItems.map(({ id, label, icon: Icon }) => <button key={id} className="hc-nav" aria-current={view === id ? "page" : undefined} onClick={() => openView(id)}><Icon size={18} />{label}</button>)}
          </nav>
        </aside>

        <main className="hc-main">
          <header className="hc-top">
            <span>{space.name} / {view === "home" ? "Our home" : view[0].toUpperCase() + view.slice(1)}</span>
            <div className="hc-top-actions">
              <div className="hc-notification-wrap">
                <button id="hc-notification-button" type="button" aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`} aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={18} />{unread > 0 && <span id="hc-notification-count">{unread}</span>}</button>
                {notificationsOpen && <NotificationPanel notices={notices} onRead={(id) => setNotices((current) => current.map((notice) => notice.id === id ? { ...notice, read: true } : notice))} onReadAll={() => setNotices((current) => current.map((notice) => ({ ...notice, read: true })))} />}
              </div>
              <div className="hc-user-wrap">
                <button id="hc-user-button" className="hc-profile" type="button" aria-expanded={userMenu} onClick={() => setUserMenu(!userMenu)}><span className="hc-avatar">{accountName[0]}</span><span>{accountName}</span><ChevronDown size={16} /></button>
                {userMenu && <section id="hc-user-menu" className="hc-user-menu" aria-label="User menu">
                  <div className="hc-user-summary"><span className="hc-avatar">{accountName[0]}</span><span><strong>{accountName}</strong><small>Household account</small></span></div>
                  <button type="button" onClick={() => { setAllPeople(true); openView("people"); }}><UserRound size={16} /> My profile</button>
                  <button type="button" onClick={() => { setAllPeople(true); openView("people"); }}><Users size={16} /> Manage all people</button>
                  <button type="button" onClick={() => { setProfilePanel("settings"); setUserMenu(false); }}><Settings2 size={16} /> Settings</button>
                  <button type="button" onClick={() => { setProfilePanel("accounts"); setUserMenu(false); }}><ChevronsUpDown size={16} /> Switch account</button>
                  <button type="button" onClick={() => { setNotificationsOpen(true); setUserMenu(false); }}><Bell size={16} /> Notification preferences</button>
                </section>}
              </div>
            </div>
          </header>

          {editor === "space" && <SpaceForm onCancel={() => setEditor(null)} onSubmit={(name, type) => {
            const id = Math.max(...spaces.map((item) => item.id)) + 1;
            const personId = id * 100;
            setSpaces((current) => [...current, { id, name, type, floors: 1, basements: 0, responsibleId: personId, people: [{ id: personId, name: "Jamie", role: "Family member" }], rooms: [{ id: personId + 1, name: "Kitchen", type: "Kitchen", floor: 1 }], chores: [] }]);
            setSpaceId(id); setEditor(null); setMessage(`${name} created.`);
          }} />}

          {profilePanel === "settings" && <SettingsPanel dark={dark} language={language} onThemeChange={setDark} onLanguageChange={(value) => { setLanguage(value); setMessage(`${value} saved as your language preference.`); }} onClose={() => setProfilePanel(null)} />}
          {profilePanel === "accounts" && <AccountSwitcher people={accountPeople} activeName={accountName} onSwitch={(name) => { setAccountName(name); setProfilePanel(null); setMessage(`Switched to ${name}.`); }} onClose={() => setProfilePanel(null)} />}

          {view === "chores" && <ChoresView space={space} currentUserId={currentUser?.id ?? 0} mine={mine} setMine={setMine} editor={editor} setEditor={setEditor} setChore={setChore} addChore={(chore) => { updateSpace((current) => ({ ...current, chores: [...current.chores, chore] })); setEditor(null); setMessage("Chore added to your shared board."); }} notify={notify} />}
          {view === "planning" && <PlanningView space={space} mode={planningMode} setMode={setPlanningMode} setChore={setChore} />}
          {view === "people" && <PeopleView key={space.id} spaces={spaces} space={space} all={allPeople} setAll={setAllPeople} editor={editor} setEditor={setEditor} addPerson={(name, role) => { updateSpace((current) => ({ ...current, people: [...current.people, { id: Date.now(), name, role }] })); setEditor(null); setMessage("Your household has been updated."); }} updatePerson={(originalName, patch) => { setSpaces((current) => current.map((item) => ({ ...item, people: item.people.map((person) => person.name === originalName ? { ...person, ...patch } : person) }))); if (accountName === originalName && patch.name) setAccountName(patch.name); setMessage(`${patch.name ?? originalName} updated.`); }} deletePerson={deletePerson} />}
          {view === "home" && <HomeView key={space.id} space={space} canDelete={spaces.length > 1} deleteHome={deleteCurrentSpace} setResponsible={(responsibleId) => { updateSpace((current) => ({ ...current, responsibleId })); setMessage(`${space.people.find((person) => person.id === responsibleId)?.name} is now responsible for ${space.name}.`); notify("Home responsible updated", space.name); }} updateHome={(patch) => { updateSpace((current) => { const floors = patch.floors ?? current.floors; const basements = patch.basements ?? current.basements; return { ...current, ...patch, rooms: current.rooms.map((room) => ({ ...room, floor: room.floor < 0 ? (basements ? Math.max(room.floor, -basements) : 1) : Math.min(room.floor, floors) })) }; }); setMessage(`${patch.name ?? space.name} updated.`); }} addRoom={(room) => { updateSpace((current) => ({ ...current, rooms: [...current.rooms, room] })); setMessage(`${room.name} added.`); }} updateRoom={(id, patch) => { updateSpace((current) => ({ ...current, rooms: current.rooms.map((room) => room.id === id ? { ...room, ...patch } : room) })); setMessage("Room updated."); }} />}
          <div className="hc-feedback" aria-live="polite">{message}</div>
        </main>
      </div>
    </div>
  );
}

function Heading({ action }: { action?: React.ReactNode }) {
  return action ? <div className="hc-heading">{action}</div> : null;
}

function SettingsPanel({ dark, language, onThemeChange, onLanguageChange, onClose }: { dark: boolean; language: string; onThemeChange: (value: boolean) => void; onLanguageChange: (value: string) => void; onClose: () => void }) {
  return <section className="hc-profile-panel" aria-label="Profile settings">
    <div className="hc-form-head"><div><h2>Settings</h2><span className="hc-label">Profile preferences</span></div><button className="hc-quiet" type="button" aria-label="Close settings" onClick={onClose}><X size={18} /></button></div>
    <div className="hc-setting-row"><span><strong>Appearance</strong><small>Choose the theme used on this device.</small></span><div className="hc-theme"><span>{dark ? "Dark" : "Light"}</span><button id="hc-theme-toggle" type="button" role="switch" aria-checked={dark} aria-label="Dark theme" onClick={() => onThemeChange(!dark)}><span className="hc-theme-track"><span className="hc-theme-thumb" /></span></button></div></div>
    <div className="hc-setting-row"><span><strong>Language</strong><small>Saved now for future localization.</small></span><select aria-label="Interface language" value={language} onChange={(event) => onLanguageChange(event.target.value)}><option>English</option><option>French</option><option>Japanese</option><option>Spanish</option></select></div>
  </section>;
}

function AccountSwitcher({ people, activeName, onSwitch, onClose }: { people: Person[]; activeName: string; onSwitch: (name: string) => void; onClose: () => void }) {
  return <section className="hc-profile-panel" aria-label="Switch account">
    <div className="hc-form-head"><div><h2>Switch account</h2><span className="hc-label">Choose who is using Fresh Home.</span></div><button className="hc-quiet" type="button" aria-label="Close account switcher" onClick={onClose}><X size={18} /></button></div>
    <div className="hc-account-list">{people.map((person) => <button type="button" key={person.name} aria-current={person.name === activeName} onClick={() => onSwitch(person.name)}><span className="hc-avatar">{person.name[0]}</span><span><strong>{person.name}</strong><small>{person.role}</small></span>{person.name === activeName && <Check size={17} />}</button>)}</div>
  </section>;
}

function ChoresView({ space, currentUserId, mine, setMine, editor, setEditor, setChore, addChore, notify }: {
  space: SharedSpace; currentUserId: number; mine: boolean; setMine: (value: boolean) => void; editor: string | null; setEditor: (value: "chore" | null) => void; setChore: (id: number, patch: Partial<Chore>) => void; addChore: (chore: Chore) => void; notify: (title: string, detail: string) => void;
}) {
  const visible = space.chores.filter((chore) => !mine || chore.personId === currentUserId);
  const completed = visible.filter((chore) => (chore.completedDates ?? []).includes(today)).length;
  return <>
    <Heading action={<button className="hc-button hc-primary" onClick={() => setEditor("chore")}><Plus size={16} /> Add chore</button>} />
    <div className="hc-chore-tabs"><button aria-pressed={!mine} onClick={() => setMine(false)}>All chores <span>{space.chores.length}</span></button><button aria-pressed={mine} onClick={() => setMine(true)}>My tasks <span>{space.chores.filter((chore) => chore.personId === currentUserId).length}</span></button></div>
    {editor === "chore" && <ChoreForm space={space} defaultPersonId={mine ? currentUserId : 0} onCancel={() => setEditor(null)} onSubmit={addChore} />}
    <section className="hc-banner"><div><h2>Every little bit makes a difference</h2><p>{completed} of {visible.length} chores complete on your shared board</p><div className="hc-progress"><span style={{ width: `${visible.length ? (completed / visible.length) * 100 : 0}%` }} /></div></div><div className="hc-score">{completed} / {visible.length}</div></section>
    <div className="hc-section-title"><h2>{mine ? "My chore board" : "Your shared chore board"}</h2><span className="hc-label">{visible.filter((chore) => !(chore.completedDates ?? []).includes(today)).length} to do</span></div>
    <div className="hc-grid">{visible.map((chore) => {
      const room = space.rooms.find((item) => item.id === chore.roomId);
      const person = space.people.find((item) => item.id === chore.personId);
      const completedToday = (chore.completedDates ?? []).includes(today);
      return <article className={`hc-task ${completedToday ? "hc-done" : ""}`} key={chore.id}>
        <div className="hc-task-top"><span className="hc-room-icon"><Home size={18} /></span><label className="hc-repeat"><span>Repeats</span><select aria-label={`Recurrence for ${chore.name}`} value={chore.frequency} onChange={(event) => { setChore(chore.id, { frequency: event.target.value as Recurrence }); notify("Recurrence updated", chore.name); }}><option>One-off</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label></div>
        <h2>{chore.name}</h2><p>{room?.name ?? "Choose a room"} · {chore.startTime} · {chore.time}</p>
        <div className="hc-tools"><div className="hc-tools-head"><span>Tools & supplies</span></div><div className="hc-tool-list">{chore.tools.length ? chore.tools.map((tool) => <span className="hc-tool-pill" key={tool}>{tool}</span>) : <span className="hc-label">No tools needed</span>}</div></div>
        <div className="hc-task-bottom"><div className="hc-assignee"><span className="hc-avatar">{person?.name[0] ?? "?"}</span><select aria-label={`Assign ${chore.name}`} value={chore.personId} onChange={(event) => setChore(chore.id, { personId: Number(event.target.value) })}><option value={0}>Unassigned</option>{space.people.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div><button className="hc-check" aria-label={`${completedToday ? "Reopen" : "Complete"} ${chore.name} for today`} aria-pressed={completedToday} onClick={() => { const current = chore.completedDates ?? []; const completedDates = completedToday ? current.filter((date) => date !== today) : [...current, today]; setChore(chore.id, { completedDates, done: completedDates.length > 0, doneOn: completedDates[completedDates.length - 1] }); }}><Check size={16} /></button></div>
      </article>;
    })}</div>
    {!visible.length && <p className="hc-empty">{mine ? "No chores assigned to you yet." : "No chores in this shared space yet."}</p>}
  </>;
}

function ChoreForm({ space, defaultPersonId, onCancel, onSubmit }: { space: SharedSpace; defaultPersonId: number; onCancel: () => void; onSubmit: (chore: Chore) => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    onSubmit({ id: Date.now(), name: String(data.get("name")), roomId: Number(data.get("room")), personId: Number(data.get("person")), time: String(data.get("time")), startTime: String(data.get("startTime")), frequency: data.get("frequency") as Recurrence, tools: String(data.get("tools") || "").split(",").map((item) => item.trim()).filter(Boolean), scheduled: String(data.get("scheduled")), done: false });
  };
  return <form className="hc-form" onSubmit={submit}><div className="hc-form-head"><h2>A new chore</h2><button className="hc-button" type="button" onClick={onCancel}>Cancel</button></div><div className="hc-fields"><label>Chore name<input name="name" required placeholder="e.g. Mop the kitchen floor" /></label><label>Room / place<select name="room">{space.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select></label><label>Assign to<select name="person" defaultValue={defaultPersonId}><option value={0}>Unassigned</option>{space.people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label><label>Repeats<select name="frequency" defaultValue="Weekly"><option>One-off</option><option>Daily</option><option>Weekly</option><option>Monthly</option></select></label><label>Estimated time<select name="time" defaultValue="15 min"><option>5 min</option><option>10 min</option><option>15 min</option><option>20 min</option><option>30 min</option><option>45 min</option><option>60 min</option><option>90 min</option></select></label><label>Start time<input type="time" name="startTime" min="06:00" max="22:00" step="1800" defaultValue="09:00" required /></label><label>Scheduled for<input type="date" name="scheduled" defaultValue={today} /></label><label>Tools & supplies<input name="tools" placeholder="Mop, bucket, gloves" /></label></div><div className="hc-actions"><button className="hc-button hc-primary">Create chore</button></div></form>;
}

function PlanningView({ space, mode, setMode, setChore }: { space: SharedSpace; mode: "scheduled" | "completed"; setMode: (mode: "scheduled" | "completed") => void; setChore: (id: number, patch: Partial<Chore>) => void }) {
  const [scale, setScale] = useState<"week" | "day">("week");
  const [offset, setOffset] = useState(0);
  const periodStart = addDays(today, scale === "week" ? offset * 7 : offset);
  const days = Array.from({ length: scale === "week" ? 7 : 1 }, (_, index) => addDays(periodStart, index));
  const halfHours = Array.from({ length: 33 }, (_, index) => {
    const totalMinutes = 360 + index * 30;
    return `${String(Math.floor(totalMinutes / 60)).padStart(2, "0")}:${totalMinutes % 60 ? "30" : "00"}`;
  });
  const completionDates = (chore: Chore) => chore.completedDates ?? (chore.doneOn ? [chore.doneOn] : []);
  const occurrences = (chore: Chore) => {
    if (mode === "completed") return completionDates(chore).filter((date) => days.includes(date));
    return days.filter((day) => {
      if (day < chore.scheduled) return false;
      const scheduled = new Date(`${chore.scheduled}T12:00:00`);
      const candidate = new Date(`${day}T12:00:00`);
      const dayDifference = Math.round((candidate.getTime() - scheduled.getTime()) / 86_400_000);
      if (chore.frequency === "Daily") return true;
      if (chore.frequency === "Weekly") return dayDifference % 7 === 0;
      if (chore.frequency === "Monthly") return candidate.getDate() === scheduled.getDate();
      return day === chore.scheduled;
    });
  };
  const rows = space.chores.filter((chore) => occurrences(chore).length > 0);
  const toggleOccurrence = (chore: Chore, date: string) => {
    const current = completionDates(chore);
    const completed = current.includes(date);
    const completedDates = completed ? current.filter((item) => item !== date) : [...current, date].sort();
    setChore(chore.id, { completedDates, done: completedDates.length > 0, doneOn: completedDates[completedDates.length - 1] });
  };
  const periodTitle = scale === "week" ? `${shortDate(days[0])} – ${shortDate(days[6])}` : new Date(`${days[0]}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return <>
    <div className="hc-week-toolbar"><div><h2>{periodTitle}</h2><span className="hc-label">{scale === "week" ? "Seven-day schedule" : "Hourly schedule · 06:00–22:00"}</span></div><div className="hc-week-actions"><button className="hc-button" onClick={() => setOffset((value) => value - 1)}><ChevronLeft size={16} />Previous</button><button className="hc-button" onClick={() => setOffset(0)}>{scale === "week" ? "This week" : "Today"}</button><button className="hc-button" onClick={() => setOffset((value) => value + 1)}>Next<ChevronRight size={16} /></button></div></div>
    <div className="hc-planning-controls"><div className="hc-chore-tabs"><button aria-pressed={mode === "scheduled"} onClick={() => setMode("scheduled")}>Scheduled</button><button aria-pressed={mode === "completed"} onClick={() => setMode("completed")}>Completed</button></div><div className="hc-view-toggle" aria-label="Planning view"><button aria-pressed={scale === "week"} onClick={() => { setScale("week"); setOffset(0); }}>Week</button><button aria-pressed={scale === "day"} onClick={() => { setScale("day"); setOffset(0); }}>Day</button></div></div>
    <section className="hc-gantt" aria-label={`${mode} chore schedule`}>
      <div className={`hc-gantt-table ${scale === "day" ? "hc-gantt-daily" : ""}`}>
        <div className="hc-gantt-corner">Task</div>
        {scale === "week" ? <div className="hc-gantt-days">{days.map((day) => <div key={day} data-today={day === today}><strong>{new Date(`${day}T12:00:00`).toLocaleDateString("en-US", { weekday: "short" })}</strong><span>{shortDate(day)}</span></div>)}</div> : <div className="hc-gantt-hours">{halfHours.map((time) => <div key={time}><span>{time.endsWith(":00") ? time : ""}</span></div>)}</div>}
        {rows.map((chore) => {
          const person = space.people.find((item) => item.id === chore.personId);
          const room = space.rooms.find((item) => item.id === chore.roomId);
          const dates = occurrences(chore);
          const [startHour, startMinute] = chore.startTime.split(":").map(Number);
          const startColumn = Math.max(1, Math.min(33, Math.round((startHour - 6) * 2 + startMinute / 30) + 1));
          const durationSlots = Math.max(1, Math.ceil(Number.parseInt(chore.time) / 30));
          return <div className={`hc-gantt-row ${scale === "day" ? "hc-gantt-row-daily" : ""}`} key={chore.id}>
            <div className="hc-gantt-label"><strong>{chore.name}</strong><span>{person?.name ?? "Unassigned"} · {room?.name ?? "No room"}</span></div>
            {scale === "week" ? <div className="hc-gantt-track">{days.map((day) => <div className="hc-gantt-cell" data-today={day === today} key={day} />)}{dates.map((date) => <button type="button" className="hc-gantt-bar" style={{ gridColumn: days.indexOf(date) + 1 }} key={date} aria-label={`${chore.name} on ${shortDate(date)}`} aria-pressed={completionDates(chore).includes(date)} onClick={() => toggleOccurrence(chore, date)}><span>{chore.startTime}</span></button>)}</div> : <div className="hc-gantt-track hc-gantt-track-hours">{halfHours.map((time) => <div className="hc-gantt-cell" key={time} />)}{dates.map((date) => <button type="button" className="hc-gantt-bar hc-gantt-hour-bar" style={{ gridColumn: `${startColumn} / span ${durationSlots}` }} key={date} aria-label={`${chore.name} at ${chore.startTime} on ${shortDate(date)}`} aria-pressed={completionDates(chore).includes(date)} onClick={() => toggleOccurrence(chore, date)}><span>{chore.startTime} · {chore.time}</span></button>)}</div>}
          </div>;
        })}
        {!rows.length && <div className="hc-gantt-empty">No chores to show in this view.</div>}
      </div>
    </section>
  </>;
}

function PeopleView({ spaces, space, all, setAll, editor, setEditor, addPerson, updatePerson, deletePerson }: { spaces: SharedSpace[]; space: SharedSpace; all: boolean; setAll: (value: boolean) => void; editor: string | null; setEditor: (value: "person" | null) => void; addPerson: (name: string, role: Person["role"]) => void; updatePerson: (originalName: string, patch: Partial<Person>) => void; deletePerson: (name: string, everywhere: boolean) => void }) {
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const directory = useMemo(() => {
    const members = new Map<string, { person: Person; spaces: SharedSpace[] }>();
    spaces.forEach((item) => item.people.forEach((person) => { const key = person.name.toLowerCase(); const existing = members.get(key); if (existing) existing.spaces.push(item); else members.set(key, { person, spaces: [item] }); }));
    return [...members.values()];
  }, [spaces]);
  return <>
    <Heading action={<button className="hc-button hc-primary" onClick={() => { setEditingPerson(null); setEditor("person"); }}><Plus size={16} /> Add person</button>} />
    <div className="hc-chore-tabs"><button aria-pressed={!all} onClick={() => setAll(false)}>{space.name}</button><button aria-pressed={all} onClick={() => setAll(true)}>All people <span>{directory.length}</span></button></div>
    {editor === "person" && <PersonForm person={editingPerson} deleteLabel={all ? "Remove from all spaces" : `Remove from ${space.name}`} onCancel={() => { setEditor(null); setEditingPerson(null); }} onDelete={editingPerson ? () => { deletePerson(editingPerson.name, all); setEditor(null); setEditingPerson(null); } : undefined} onSubmit={(name, role) => { if (editingPerson) updatePerson(editingPerson.name, { name, role }); else addPerson(name, role); setEditor(null); setEditingPerson(null); }} />}
    <div className="hc-grid">{(all ? directory : space.people.map((person) => ({ person, spaces: [space] }))).map(({ person, spaces: memberSpaces }) => <article className="hc-member" key={person.name}><div className="hc-member-head"><span className="hc-avatar">{person.name[0]}</span><div><h2>{person.name}</h2><p className="hc-label">{person.role}</p><div className="hc-member-spaces">{memberSpaces.map((item) => <span key={item.id}>{item.name}{item.responsibleId === item.people.find((member) => member.name === person.name)?.id ? " · Responsible" : ""}</span>)}</div>{!all && space.responsibleId === person.id && <span className="hc-owner-badge"><ShieldCheck size={13} /> Home responsible</span>}</div></div><div className="hc-member-footer"><span className="hc-label">{memberSpaces.length} shared space{memberSpaces.length === 1 ? "" : "s"}</span><button className="hc-quiet" aria-label={`Manage ${person.name}`} onClick={() => { setEditingPerson(person); setEditor("person"); }}><Settings2 size={16} /></button></div></article>)}</div>
  </>;
}

function PersonForm({ person, deleteLabel, onCancel, onSubmit, onDelete }: { person?: Person | null; deleteLabel?: string; onCancel: () => void; onSubmit: (name: string, role: Person["role"]) => void; onDelete?: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <form className="hc-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit(String(data.get("name")), data.get("role") as Person["role"]); }}><div className="hc-form-head"><h2>{person ? `Manage ${person.name}` : "Add someone to your home"}</h2><button className="hc-button" type="button" onClick={onCancel}>Cancel</button></div><div className="hc-fields"><label>Name<input name="name" required defaultValue={person?.name} placeholder="e.g. Taylor" /></label><label>Relationship<select name="role" defaultValue={person?.role ?? "Family member"}><option>Family member</option><option>Roommate</option></select></label></div><div className="hc-actions hc-actions-split">{onDelete && <button className="hc-button hc-danger" type="button" onClick={() => confirmDelete ? onDelete() : setConfirmDelete(true)}>{confirmDelete ? `Confirm: ${deleteLabel}` : deleteLabel}</button>}<button className="hc-button hc-primary">{person ? "Save changes" : "Add person"}</button></div></form>;
}

function HomeView({ space, canDelete, deleteHome, setResponsible, updateHome, addRoom, updateRoom }: { space: SharedSpace; canDelete: boolean; deleteHome: () => void; setResponsible: (id: number) => void; updateHome: (patch: Partial<SharedSpace>) => void; addRoom: (room: Room) => void; updateRoom: (id: number, patch: Partial<Room>) => void }) {
  const [setupOpen, setSetupOpen] = useState(false);
  const [roomEditor, setRoomEditor] = useState<number | "new" | null>(null);
  const responsible = space.people.find((person) => person.id === space.responsibleId);
  const selectedRoom = typeof roomEditor === "number" ? space.rooms.find((room) => room.id === roomEditor) : undefined;
  const levels = [...Array.from({ length: space.basements }, (_, index) => -(space.basements - index)), ...Array.from({ length: space.floors }, (_, index) => index + 1)];
  return <>
    <Heading action={<div className="hc-heading-actions"><button className="hc-button" onClick={() => { setSetupOpen(false); setRoomEditor("new"); }}><Plus size={16} /> Add room</button><button className="hc-button hc-primary" aria-pressed={setupOpen} onClick={() => { setRoomEditor(null); setSetupOpen(!setupOpen); }}><Settings2 size={16} /> Set up home</button></div>} />
    {setupOpen && <HomeSetupForm space={space} canDelete={canDelete} onDelete={deleteHome} onCancel={() => setSetupOpen(false)} onSubmit={(patch) => { updateHome(patch); setSetupOpen(false); }} />}
    {roomEditor && <RoomForm room={selectedRoom} floors={space.floors} basements={space.basements} onCancel={() => setRoomEditor(null)} onSubmit={(patch) => { if (selectedRoom) updateRoom(selectedRoom.id, patch); else addRoom({ id: Date.now(), name: patch.name ?? "New room", type: patch.type ?? "Other", floor: patch.floor ?? 1 }); setRoomEditor(null); }} />}
    <section className="hc-responsible"><div className="hc-responsible-info"><span><ShieldCheck size={18} /></span><span><strong>{responsible?.name ?? "No responsible person"}</strong><small>Responsible for {space.name}</small></span></div><label>Change responsible<select aria-label={`Responsible person for ${space.name}`} value={space.responsibleId} onChange={(event) => setResponsible(Number(event.target.value))}><option value={0}>No responsible person</option>{space.people.map((person) => <option key={person.id} value={person.id}>{person.name}</option>)}</select></label></section>
    {levels.map((floor) => <section className="hc-floor" key={floor}><h2>{floorLabel(floor)}</h2><div className="hc-grid">{space.rooms.filter((room) => room.floor === floor).map((room) => <article className="hc-room" key={room.id}><div className="hc-room-main"><span className="hc-room-icon"><Home size={18} /></span><div><h2>{room.name}</h2><p>{room.type} · {space.chores.filter((chore) => chore.roomId === room.id && !chore.done).length} chores to do</p></div></div><button className="hc-quiet" type="button" aria-label={`Edit ${room.name}`} onClick={() => { setSetupOpen(false); setRoomEditor(room.id); }}><Settings2 size={16} /></button></article>)}</div></section>)}
  </>;
}

function HomeSetupForm({ space, canDelete, onDelete, onCancel, onSubmit }: { space: SharedSpace; canDelete: boolean; onDelete: () => void; onCancel: () => void; onSubmit: (patch: Partial<SharedSpace>) => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <form className="hc-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ name: String(data.get("name")), type: String(data.get("type")), floors: Number(data.get("floors")), basements: Number(data.get("basements")) }); }}><div className="hc-form-head"><h2>Set up {space.name}</h2><button className="hc-button" type="button" onClick={onCancel}>Cancel</button></div><div className="hc-fields"><label>Home name<input name="name" required defaultValue={space.name} /></label><label>Type<select name="type" defaultValue={space.type}><option>House</option><option>Apartment</option><option>Shared house</option><option>Other</option></select></label><label>Above-ground floors<input name="floors" type="number" min={1} max={10} required defaultValue={space.floors} /></label><label>Underground floors<input name="basements" type="number" min={0} max={5} required defaultValue={space.basements} /><span className="hc-label">Use 1 for B1, 2 for B1 and B2.</span></label></div><div className="hc-actions hc-actions-split"><button className="hc-button hc-danger" type="button" disabled={!canDelete} title={canDelete ? undefined : "At least one shared space is required"} onClick={() => confirmDelete ? onDelete() : setConfirmDelete(true)}>{confirmDelete ? `Confirm: delete ${space.name}` : "Delete shared space"}</button><button className="hc-button hc-primary">Save home</button></div></form>;
}

function RoomForm({ room, floors, basements, onCancel, onSubmit }: { room?: Room; floors: number; basements: number; onCancel: () => void; onSubmit: (patch: Partial<Room>) => void }) {
  const levels = [...Array.from({ length: basements }, (_, index) => -(basements - index)), ...Array.from({ length: floors }, (_, index) => index + 1)];
  return <form className="hc-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit({ name: String(data.get("name")), type: String(data.get("type")), floor: Number(data.get("floor")) }); }}><div className="hc-form-head"><h2>{room ? `Edit ${room.name}` : "Add a room"}</h2><button className="hc-button" type="button" onClick={onCancel}>Cancel</button></div><div className="hc-fields"><label>Room name<input name="name" required defaultValue={room?.name} placeholder="e.g. Guest bedroom" /></label><label>Room type<select name="type" defaultValue={room?.type ?? "Bedroom"}><option>Kitchen</option><option>Bathroom</option><option>Living room</option><option>Bedroom</option><option>Dining room</option><option>Office</option><option>Laundry room</option><option>Garage</option><option>Outdoor</option><option>Other</option></select></label><label>Floor<select name="floor" defaultValue={room?.floor ?? 1}>{levels.map((floor) => <option value={floor} key={floor}>{floorLabel(floor)}</option>)}</select></label></div><div className="hc-actions"><button className="hc-button hc-primary">{room ? "Save room" : "Add room"}</button></div></form>;
}

function SpaceForm({ onCancel, onSubmit }: { onCancel: () => void; onSubmit: (name: string, type: string) => void }) {
  return <form className="hc-form" onSubmit={(event) => { event.preventDefault(); const data = new FormData(event.currentTarget); onSubmit(String(data.get("name")), String(data.get("type"))); }}><div className="hc-form-head"><h2>New shared space</h2><button className="hc-quiet" type="button" onClick={onCancel}><X size={18} /></button></div><div className="hc-fields"><label>Space name<input name="name" required placeholder="e.g. Lake House" /></label><label>Type<select name="type"><option>House</option><option>Apartment</option><option>Shared house</option><option>Other</option></select></label></div><div className="hc-actions"><button className="hc-button hc-primary">Create shared space</button></div></form>;
}

function NotificationPanel({ notices, onRead, onReadAll }: { notices: Notice[]; onRead: (id: number) => void; onReadAll: () => void }) {
  return <section className="hc-notifications" aria-label="Notification center"><div className="hc-notification-head"><h2>Notifications</h2><button type="button" onClick={onReadAll}>Mark all read</button></div><ul className="hc-notification-list">{notices.map((notice) => <li key={notice.id}><button className="hc-notification-item" type="button" aria-pressed={notice.read} onClick={() => onRead(notice.id)}><span className="hc-notification-dot" /><span><strong>{notice.title}</strong><small>{notice.detail}</small></span></button></li>)}</ul><details className="hc-notification-settings"><summary>Notification preferences</summary><div className="hc-pref-list"><label><input type="checkbox" defaultChecked />Assignments</label><label><input type="checkbox" defaultChecked />Due-date reminders</label><label><input type="checkbox" defaultChecked />Completion updates</label></div></details></section>;
}
