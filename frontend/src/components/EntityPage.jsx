import { useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "./Icon.jsx";
import { usePanel } from "../context/contexts.js";
import { request, save } from "../service/api.js";
import { filtrar } from "../utils/domain.js";

export default function EntityPage({ title, description, singular, path, rows, columns, fields, initial, numeric = [], validate, searchValues, prepare, onFieldChange, embedded = false }) {
  const Heading = embedded ? "h2" : "h1";
  const ending = ["Cancha", "Reserva"].includes(singular) ? "a" : "o";
  const { refresh, loading } = usePanel();
  const [params] = useSearchParams();
  const [form, setForm] = useState(initial);
  const [id, setId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const formRef = useRef(null);
  const shown = filtrar(rows, params.get("q"), searchValues);
  function clear(focus = false) {
    setForm(typeof initial === "function" ? initial() : { ...initial }); setId(null); setNotice(null);
    if (focus) { formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }); formRef.current?.querySelector("input,select")?.focus(); }
  }
  function edit(row) {
    const base = typeof initial === "function" ? initial() : initial;
    setForm(Object.fromEntries(Object.keys(base).map(key => [key, row[key] ?? base[key]])));
    setId(row.id); setNotice(null); formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  async function submit(event) {
    event.preventDefault(); if (pending.current || loading) return;
    const message = validate?.(form, id);
    if (message) { setNotice({ error: true, text: message }); return; }
    pending.current = true; setBusy(true); setNotice(null);
    try {
      let data = { ...form };
      numeric.forEach(key => { data[key] = Number(data[key]); });
      if (prepare) data = prepare(data, id);
      await save(path, data, id);
      setForm(typeof initial === "function" ? initial() : { ...initial }); setId(null);
      setNotice({ text: `${singular} ${id ? "actualizad" : "registrad"}${ending} correctamente.` });
      await refresh();
    } catch (failure) { setNotice({ error: true, text: failure.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  async function remove(row) {
    if (pending.current || !window.confirm(`¿Eliminar ${singular.toLowerCase()} #${row.id}?`)) return;
    pending.current = true; setBusy(true); setNotice(null);
    try {
      await request(`${path}/${row.id}`, { method: "DELETE" });
      if (id === row.id) clear();
      setNotice({ text: `${singular} eliminad${ending} correctamente.` }); await refresh();
    } catch (failure) { setNotice({ error: true, text: failure.message }); }
    finally { pending.current = false; setBusy(false); }
  }
  function change(event) {
    const next = { ...form, [event.target.name]: event.target.value };
    setForm(onFieldChange ? onFieldChange(next, event.target.name, id) : next);
  }
  return <section>
    <div className="pagina-encabezado"><div><Heading>{title}</Heading><p>{description}</p></div>
      <button className="btn-crear" type="button" disabled={busy || loading} onClick={() => clear(true)}><Icon name="plus" size={18} /> Registrar {singular.toLowerCase()}</button></div>
    {notice && <p role={notice.error ? "alert" : "status"} className={`operation-notice ${notice.error ? "error" : "ok"}`}>{notice.text}</p>}
    <div className="tabla-caja"><div className="tabla-cabecera"><h3>{title}</h3><span className="tabla-count">{shown.length} registros</span></div>
      <table className="tabla"><thead><tr>{columns.map(column => <th key={column.key}>{column.label}</th>)}<th>Acciones</th></tr></thead>
        <tbody>{shown.length === 0 && <tr><td colSpan={columns.length + 1} className="tabla-vacio">{loading ? "Cargando…" : params.get("q") ? "No hay coincidencias para tu búsqueda." : "No hay registros."}</td></tr>}
          {shown.map(row => <tr key={row.id}>{columns.map(column => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}<td><div className="acciones">
            <button type="button" className="btn-accion editar" disabled={busy || loading} aria-label={`Editar ${singular.toLowerCase()} ${row.id}`} title="Editar" onClick={() => edit(row)}><Icon name="edit" size={17} /></button>
            <button type="button" className="btn-accion eliminar" disabled={busy || loading} aria-label={`Eliminar ${singular.toLowerCase()} ${row.id}`} title="Eliminar" onClick={() => remove(row)}><Icon name="trash" size={17} /></button>
          </div></td></tr>)}</tbody></table></div>
    <div className="panel-formulario" ref={formRef}><h3>{id ? `Editar ${singular.toLowerCase()} #${id}` : `Registrar ${singular.toLowerCase()}`}</h3>
      <form onSubmit={submit}><fieldset disabled={busy || loading}><div className="form-grid">
        {fields.map(field => { const fieldId = `${path.slice(1)}-${field.name}`; const options = typeof field.options === "function" ? field.options(form, id) : field.options;
          const current = form[field.name];
          const missingOption = current !== "" && current != null && options && !options.some(option => String(typeof option === "string" ? option : option.value) === String(current));
          return <div className="campo" key={field.name}><label htmlFor={fieldId}>{field.label}</label>{options ?
            <select id={fieldId} name={field.name} value={form[field.name] ?? ""} onChange={change} required={field.required}>
              {field.placeholder && <option value="">{field.placeholder}</option>}{missingOption && <option value={current}>{current} · valor actual</option>}{options.map(option => <option key={typeof option === "string" ? option : option.value} value={typeof option === "string" ? option : option.value} disabled={option.disabled}>{typeof option === "string" ? option : option.label}</option>)}
            </select> : <input id={fieldId} name={field.name} type={field.type || "text"} value={form[field.name] ?? ""} onChange={change} required={field.required} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength} pattern={field.pattern} readOnly={field.readOnly} />}
            {field.help && <small>{field.help}</small>}</div>; })}
        <div className="form-botones"><button className="btn-guardar" type="submit"><Icon name="save" size={17} />{busy ? "Guardando…" : "Guardar"}</button>
          <button className="btn-actualizar" type="button" onClick={() => clear()}><Icon name="reset" size={17} />{id ? "Cancelar edición" : "Limpiar"}</button></div>
      </div></fieldset></form></div>
  </section>;
}
