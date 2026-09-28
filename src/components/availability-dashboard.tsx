'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, LockKeyhole, Pencil, Plus, RotateCcw, Save, Settings2, Trash2, X } from 'lucide-react'

// --- Tipos de la API ---
type DiaEstadoAPI = 'SIN_ASIGNAR' | 'HORARIO_ASIGNADO' | 'BLOQUEADO'
type TipoIntervaloAPI = 'LABORAL' | 'BLOQUEADO'

interface DiaCalendarioDTO { diaId: string; fecha: string; estado: DiaEstadoAPI }
interface IntervaloDTO { id: string; horaInicio: string | null; horaFin: string | null; tipo: TipoIntervaloAPI | null }
interface DiaDetalleDTO { diaId: string; fecha: string; estado: DiaEstadoAPI; intervalos: IntervaloDTO[] }

// --- Configuración ---
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5173/api'
const USUARIO_ID = process.env.NEXT_PUBLIC_USUARIO_ID || 'admin-test'

const weekdays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const shortDays = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']

// Helpers de fecha
const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
const asDate = (value: string) => new Date(`${value}T00:00:00`)
const formatMonth = (date: Date) => date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

let toastTimeout: any;

export function AvailabilityDashboard() {
  const [view, setView] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(new Date()) 
  const [selectedDate, setSelectedDate] = useState(dateKey(new Date()))
  
  const visibleDates = useMemo(() => {
    if (view === 'month') {
      const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0)
      return Array.from({ length: last.getDate() }, (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1))
    } else {
      const dayOfWeek = (cursor.getDay() + 6) % 7 // Lunes = 0
      const monday = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - dayOfWeek)
      return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
    }
  }, [cursor, view])
  
  const [calendarDays, setCalendarDays] = useState<DiaCalendarioDTO[]>([])
  const [dayDetail, setDayDetail] = useState<DiaDetalleDTO | null>(null)
  
  const [modal, setModal] = useState<'interval' | 'edit' | 'delete' | null>(null)
  const [editing, setEditing] = useState<IntervaloDTO | null>(null)
  const [toast, setToast] = useState('')
  const [form, setForm] = useState({ start: '', end: '', tipo: 'LABORAL' as TipoIntervaloAPI })
  
  const [lead, setLead] = useState('24')
  const [unit, setUnit] = useState('HORAS')
  const [limit, setLimit] = useState('5')

  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    Lunes: true, Martes: true, Miércoles: true, Jueves: true, Viernes: true, Sábado: true, Domingo: true
  })

  const toggleWeekday = (name: string) => {
    setEnabled((current) => ({ ...current, [name]: !current[name] }))
    notify(`${name} quedó ${enabled[name] ? 'deshabilitado' : 'habilitado'} para editar.`)
  }

  function notify(message: string) { 
    setToast(message); 
    clearTimeout(toastTimeout); // Cancelamos cualquier temporizador previo
    toastTimeout = setTimeout(() => setToast(''), 4000); // Iniciamos uno nuevo
  }

  const fetchCalendar = async () => {
    if (visibleDates.length === 0) return;
    
    // Obtenemos dinámicamente el inicio y el fin de lo que se ve en pantalla
    const desde = dateKey(visibleDates[0])
    const hasta = dateKey(visibleDates[visibleDates.length - 1])
    
    try {
      const res = await fetch(`${API_URL}/disponibilidad?usuarioId=${USUARIO_ID}&desde=${desde}&hasta=${hasta}`)
      if (res.ok) setCalendarDays(await res.json())
    } catch (e) { console.error("Error calendario",e) }
  }

  function navigate(amount: number) {
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + (view === 'month' ? amount : 0), current.getDate() + (view === 'week' ? amount * 7 : 0)))
  }
  
  const fetchDayDetail = async () => {
    const diaEnCalendario = calendarDays.find(d => d.fecha === selectedDate)
    if (!diaEnCalendario || !diaEnCalendario.diaId) {
      setDayDetail({ diaId: '', fecha: selectedDate, estado: 'SIN_ASIGNAR', intervalos: [] })
      return
    }
    try {
      const res = await fetch(`${API_URL}/disponibilidad/${diaEnCalendario.diaId}?usuarioId=${USUARIO_ID}`)
      if (res.ok) setDayDetail(await res.json())
    } catch (e) { console.error("Error detalle",e) }
  }

  const fetchPreferences = async () => {
    try {
      const resAnt = await fetch(`${API_URL}/preferencias/reuniones/antelacion-minima?usuarioId=${USUARIO_ID}`)
      if (resAnt.ok) {
        const data = await resAnt.json()
        if (data.valor) { setLead(data.valor.toString()); setUnit(data.unidad) }
      }
      const resLim = await fetch(`${API_URL}/preferencias/reuniones/limite-reservas-diarias?usuarioId=${USUARIO_ID}`)
      if (resLim.ok) {
        const data = await resLim.json()
        if (data.cantidad) setLimit(data.cantidad.toString())
      }
    } catch (e) {}
  }

  useEffect(() => { fetchCalendar() }, [visibleDates])
  useEffect(() => { fetchDayDetail() }, [selectedDate, calendarDays])
  useEffect(() => { fetchPreferences() }, [])

  const createEmptyInterval = async () => {
    try {
      const resPost = await fetch(`${API_URL}/disponibilidad/intervalos`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuarioId: USUARIO_ID, fecha: selectedDate })
      });
      
      if (resPost.ok) {
        notify('Intervalo añadido. Por favor, edítelo para configurarlo.');
        fetchCalendar();
        fetchDayDetail(); // Refrescar la lista de intervalos del panel
      } else {
        const errorData = await resPost.json();
        notify(errorData.error || 'Error al crear intervalo base.');
      }
    } catch (e) {
      console.error(e);
      notify('Error de red al crear intervalo.');
    }
  }

  const saveInterval = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dayDetail?.diaId || !editing?.id) {
      notify('Error: No hay un intervalo seleccionado para editar.');
      return;
    }

    try {
      const resPatch = await fetch(`${API_URL}/disponibilidad/${dayDetail.diaId}/intervalos/${editing.id}?usuarioId=${USUARIO_ID}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horaInicio: `${form.start}:00`, horaFin: `${form.end}:00`, tipo: form.tipo })
      });

      if (resPatch.ok) {
        notify('Intervalo configurado correctamente.');
        setModal(null);
        fetchCalendar(); 
        fetchDayDetail();
      } else {
        const errorData = await resPatch.json();
        notify(errorData.error || 'Error al configurar el intervalo');
      }
    } catch (e) {
      console.error(e);
      notify('Error de red al intentar guardar.');
    }
  }

  const deleteInterval = async () => {
    if (!dayDetail?.diaId || !editing?.id) return
    
    try {
      const res = await fetch(`${API_URL}/disponibilidad/${dayDetail.diaId}/intervalos/${editing.id}?usuarioId=${USUARIO_ID}`, { method: 'DELETE' })
      if (res.ok) {
        notify('El intervalo fue eliminado.')
        setModal(null)
        fetchCalendar()
      } else {
        notify('Error al eliminar el intervalo.')
      }
    } catch (e) {
      console.error(e)
      notify('Error de red al intentar eliminar.')
    }
  }

  const toggleBlockDay = async (bloquear: boolean) => {
    try {
      let currentDiaId = dayDetail?.diaId
      if (!currentDiaId) {
        const resPost = await fetch(`${API_URL}/disponibilidad/intervalos`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarioId: USUARIO_ID, fecha: selectedDate })
        })
        const dataPost = await resPost.json()
        currentDiaId = dataPost.diaId
        await fetch(`${API_URL}/disponibilidad/${currentDiaId}/intervalos/${dataPost.intervalo.id}?usuarioId=${USUARIO_ID}`, { method: 'DELETE' })
      }

      const res = await fetch(`${API_URL}/disponibilidad/${currentDiaId}/bloqueo?usuarioId=${USUARIO_ID}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloqueado: bloquear })
      })

      if (res.ok) {
        notify(bloquear ? 'Día bloqueado correctamente.' : 'Día desbloqueado.')
        fetchCalendar()
      } else {
        notify('Error al modificar el estado del día.')
      }
    } catch (e) {
      console.error(e)
      notify('Error de red: No se pudo conectar con el servidor.')
    }
  }

  const savePreferences = async (event: React.SyntheticEvent<HTMLFormElement>) => {    event.preventDefault()
    
    if (Number(lead) <= 0 || Number(limit) <= 0) {
      return notify('Ingrese un valor numérico entero mayor a cero.')
    }

    try {
      await fetch(`${API_URL}/preferencias/reuniones/antelacion-minima?usuarioId=${USUARIO_ID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ valor: Number(lead), unidad: unit })
      })
      const resLim = await fetch(`${API_URL}/preferencias/reuniones/limite-reservas-diarias?usuarioId=${USUARIO_ID}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cantidad: Number(limit) })
      })

      if (resLim.ok) {
        notify('Preferencias guardadas correctamente.')
      } else {
        const err = await resLim.json()
        notify(err.error || 'Error al guardar preferencias.')
      }
    } catch (e) {
      console.error(e)
      notify('Error de red al intentar guardar preferencias.')
    }
  }

  const renderCalendarGrid = () => {
    return visibleDates.map((currentDate, index) => {
      const dateStr = dateKey(currentDate)
      const weekdayName = weekdays[(currentDate.getDay() + 6) % 7]
      const isEnabled = enabled[weekdayName]

      const apiData = calendarDays.find(d => d.fecha === dateStr)
      
      let cssClass = 'available'
      if (!isEnabled) cssClass = 'disabled'
      else if (apiData?.estado === 'BLOQUEADO') cssClass = 'blocked'
      else if (apiData?.estado === 'HORARIO_ASIGNADO') cssClass = 'configured'

      // Solo el primer día del mes necesita empujarse en la grilla para caer bajo el día correcto
      let style = undefined
      if (index === 0 && view === 'month') {
        const firstDay = currentDate.getDay()
        style = { gridColumnStart: firstDay === 0 ? 7 : firstDay }
      }

      return (
        <button 
          key={dateStr}
          style={style}
          data-cy={`calendar-day-${currentDate.getDate()}`}
          onClick={() => {
            if (!isEnabled) {
              notify('Debe habilitar este día para editar su configuración.')
              return
            }
            setSelectedDate(dateStr)
          }}
          className={`day-cell ${cssClass} ${selectedDate === dateStr ? 'selected-day' : ''}`}
        >
          <b>{currentDate.getDate()}</b>
        </button>
      )
    })
  }

  const estadoUiClass = dayDetail?.estado === 'BLOQUEADO' ? 'blocked' : dayDetail?.estado === 'HORARIO_ASIGNADO' ? 'configured' : 'available'
  const estadoLabel = dayDetail?.estado === 'BLOQUEADO' ? 'Bloqueado' : dayDetail?.estado === 'HORARIO_ASIGNADO' ? 'Configurado' : 'Sin asignar'

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">AgendaYA <span>— Administrador</span></div>
        <button className="avatar" data-cy="profile-menu">AD</button>
      </header>

      <main className="content">
        <div className="page-heading">
          <div>
            <p className="eyebrow">CONFIGURACIÓN</p>
            <h1>Disponibilidad</h1>
            <p className="muted">Definí cuándo pueden reservar reuniones contigo.</p>
          </div>
          <div className="sync"><span className="status-dot" /> API SvelteKit Conectada</div>
        </div>

        {/* CORRECCIÓN: Etiqueta section agregada */}
        <section className="toolbar-card">
          <div className="toolbar-title">
            <CalendarDays size={18} />
            <div><strong>Calendario</strong><span>{formatMonth(cursor)}</span></div>
          </div>
          
          <div className="view-switch">
            <button data-cy="month-view-button" className={view === 'month' ? 'selected' : ''} onClick={() => setView('month')}>Vista mensual</button>
            <button data-cy="week-view-button" className={view === 'week' ? 'selected' : ''} onClick={() => setView('week')}>Vista semanal</button>
          </div>

          <div className="arrows">
            <button data-cy="previous-month" onClick={() => navigate(-1)}><ChevronLeft size={17} /></button>
            <button data-cy="next-month" onClick={() => navigate(1)}><ChevronRight size={17} /></button>
          </div>
        </section>

        <section className="workspace">
          <div className="calendar-panel">
            <div className="calendar-head">
              <span>{formatMonth(cursor).toUpperCase()}</span>
            </div>
            <div className={`calendar-grid ${view}`}>
              <div className="week-labels">{shortDays.map(day => <span key={day}>{day}</span>)}</div>
              <div className="days-grid">{renderCalendarGrid()}</div>
            </div>
          </div>

          <aside className="detail-panel">
            <div className="detail-header">
              <div>
                <p className="eyebrow">DÍA SELECCIONADO</p>
                <h2>{formatDate(selectedDate)}</h2>
              </div>
              <span className={`state-pill ${estadoUiClass}`}>{estadoLabel}</span>
            </div>

            <div className="interval-list">
              {(!dayDetail?.intervalos || dayDetail.intervalos.length === 0) ? (
                <div className="empty-state">
                  <Clock3 size={23} />
                  <span>Sin intervalos configurados</span>
                </div>
              ) : (
                dayDetail.intervalos.map((interval) => (
                  <div className={`interval-card ${interval.tipo?.toLowerCase()}`} key={interval.id}>
                    <div className="interval-time">
                      <Clock3 size={16} />
                      <strong>{interval.horaInicio?.slice(0, 5)} – {interval.horaFin?.slice(0, 5)}</strong>
                    </div>
                    <span>{interval.tipo}</span>
                      <div className="interval-actions">
                        <button 
                          data-cy={`edit-interval-${interval.id}`} 
                          onClick={() => { 
                            setEditing(interval); 
                            setForm({ 
                              start: interval.horaInicio?.slice(0,5) || '', 
                              end: interval.horaFin?.slice(0,5) || '', 
                              tipo: interval.tipo || 'LABORAL' 
                            }); 
                            setModal('edit'); 
                          }} 
                          disabled={dayDetail.estado === 'BLOQUEADO'}
                        >
                          <Pencil size={13} /> Editar
                        </button>
                        <button 
                          data-cy={`delete-interval-${interval.id}`} 
                          onClick={() => { 
                            setEditing(interval); 
                            setModal('delete'); 
                          }} 
                          disabled={dayDetail.estado === 'BLOQUEADO'}
                        >
                          <Trash2 size={13} /> Eliminar
                        </button>
                      </div>
                  </div>
                ))
              )}
            </div>

            {dayDetail?.estado === 'BLOQUEADO' ? (
              <button data-cy="unblock-day-button" className="secondary-button full-button" onClick={() => toggleBlockDay(false)}><RotateCcw size={16} /> Desbloquear día</button>
            ) : (
              <>
                <button data-cy="add-interval-button" className="primary-button" onClick={createEmptyInterval}><Plus size={17} /> Añadir intervalo</button>
                <button data-cy="block-day-button" className="danger-button" onClick={() => toggleBlockDay(true)}><LockKeyhole size={16} /> Bloquear día seleccionado</button>
              </>
            )}
          </aside>
        </section>

        <section className="bottom-grid">
          <div className="info-card">
            <div className="section-title">
              <Settings2 size={18} />
              <div>
                <h2>Configuración semanal</h2>
                <p>Habilitado = permite editar intervalos en las fechas futuras de ese día.</p>
              </div>
            </div>
            <div className="toggles">
              {weekdays.map((day) => (
                <label 
                  key={day} 
                  className="toggle-row" 
                  style={{ justifyContent: 'flex-start', gap: '12px' }}
                >
                  <span style={{ width: '70px' }}>{day}</span>
                  <input data-cy={`toggle-${day.toLowerCase()}`} type="checkbox" checked={enabled[day]} onChange={() => toggleWeekday(day)} />
                  <i />
                </label>
              ))}
            </div>
          </div>
          <form className="info-card preferences" onSubmit={savePreferences}>
            <div className="section-title">
              <Clock3 size={18} />
              <div><h2>Preferencias de reuniones</h2></div>
            </div>
            <label>Antelación mínima
              <select data-cy="lead-time-unit" value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="HORAS">Horas</option><option value="DIAS">Días</option>
              </select>
              <input data-cy="lead-time-input" type="text" value={lead} onChange={(e) => setLead(e.target.value)} />
            </label>
            <label>Límite de reservas diarias
              <input data-cy="daily-limit-input" type="text" value={limit} onChange={(e) => setLimit(e.target.value)} />
            </label>
            <button data-cy="save-preferences-button" className="secondary-button" type="submit"><Save size={16} /> Guardar preferencias</button>
          </form>
        </section>
      </main>

      {toast && <div data-cy="notification" className="toast" role="status">{toast}</div>}

      {modal && (
        <div className="modal-backdrop">
          <div className="modal" role="dialog" aria-modal="true">
            {(modal === 'interval' || modal === 'edit') && (
              <form 
                noValidate
                onSubmit={(e) => {
                  e.preventDefault(); // Forzamos que el navegador no recargue la página
                  saveInterval(e);    // Llamamos a la API
                }}
              >
                <div className="modal-title">
                  <h2>{modal === 'edit' ? 'Editar intervalo' : 'Añadir intervalo'}</h2>
                  <button type="button" className="icon-button" onClick={() => setModal(null)}><X size={18} /></button>
                </div>
                  <label>Hora de inicio 
                    <input 
                      data-cy="interval-start-input" 
                      type="text" 
                      placeholder="HH:MM"
                      maxLength={5}
                      pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                      title="Formato de 24 horas (ej. 14:30)"
                      required 
                      value={form.start} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, ''); 
                        if (val.length > 2) val = val.slice(0, 2) + ':' + val.slice(2, 4); 
                        setForm({ ...form, start: val });
                      }} 
                    />
                  </label>
                  <label>Hora de fin 
                    <input 
                      data-cy="interval-end-input" 
                      type="text" 
                      placeholder="HH:MM"
                      maxLength={5}
                      pattern="^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$"
                      title="Formato de 24 horas (ej. 14:30)"
                      required 
                      value={form.end} 
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9]/g, '');
                        if (val.length > 2) val = val.slice(0, 2) + ':' + val.slice(2, 4);
                        setForm({ ...form, end: val });
                      }} 
                    />
                  </label>
                <fieldset>
                  <label className="radio"><input data-cy="laboral-type-radio" type="radio" checked={form.tipo === 'LABORAL'} onChange={() => setForm({ ...form, tipo: 'LABORAL' })} /> Laboral</label>
                  <label className="radio"><input data-cy="blocked-type-radio" type="radio" checked={form.tipo === 'BLOQUEADO'} onChange={() => setForm({ ...form, tipo: 'BLOQUEADO' })} /> Bloqueado</label>
                </fieldset>
                <div className="modal-actions">
                  <button type="button" className="ghost-button" onClick={() => setModal(null)}>Cancelar</button>
                  <button data-cy="save-interval-button" className="primary-button" type="submit">Guardar</button>
                </div>
              </form>
            )}

            {modal === 'delete' && (
              <>
                <div className="modal-title"><h2>Eliminar intervalo</h2><button className="icon-button" onClick={() => setModal(null)}><X size={18} /></button></div>
                <p className="modal-copy">¿Desea eliminar este intervalo? Es irreversible.</p>
                <div className="modal-actions"><button className="ghost-button" onClick={() => setModal(null)}>Cancelar</button><button className="danger-button" onClick={deleteInterval} data-cy="confirm-delete-button">Eliminar</button></div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}