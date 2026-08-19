import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';
import { REF_SOURCES, RESOURCES } from './resourceConfig';

/** Builds a blank record from a resource's field list. */
const emptyRecord = (fields) =>
    fields.reduce((acc, field) => {
        if (field.defaultValue !== undefined) return { ...acc, [field.name]: field.defaultValue };
        if (field.type === 'checkbox') return { ...acc, [field.name]: false };
        // A select with no value posts an empty string, which fails schema
        // validation; start it on its first option instead.
        if (field.type === 'select') return { ...acc, [field.name]: field.options[0] };
        return { ...acc, [field.name]: '' };
    }, {});

/** Turns a saved record back into form values. */
const toFormValues = (record, fields) =>
    fields.reduce((acc, field) => {
        // Prices live in `options[0]` but the form edits them as two fields.
        if (field.name === 'half' || field.name === 'full') {
            const opts = (record.options && record.options[0]) || {};
            return { ...acc, [field.name]: opts[field.name] ?? '' };
        }

        const value = record[field.name];

        if (field.type === 'csv') {
            return { ...acc, [field.name]: Array.isArray(value) ? value.join(', ') : value || '' };
        }
        if (field.type === 'checkbox') {
            return { ...acc, [field.name]: Boolean(value) };
        }
        if (field.type === 'ref' && value && typeof value === 'object') {
            return { ...acc, [field.name]: value._id };
        }
        return { ...acc, [field.name]: value ?? '' };
    }, {});

/** Converts form values into the JSON body the API expects. */
const toPayload = (values, fields) =>
    fields.reduce((acc, field) => {
        const value = values[field.name];

        if (field.type === 'csv') {
            return {
                ...acc,
                [field.name]: String(value || '')
                    .split(',')
                    .map((entry) => entry.trim())
                    .filter(Boolean)
            };
        }
        if (field.type === 'number') {
            return { ...acc, [field.name]: value === '' ? 0 : Number(value) };
        }
        if (field.type === 'checkbox') {
            return { ...acc, [field.name]: Boolean(value) };
        }
        return { ...acc, [field.name]: value };
    }, {});

/**
 * One screen that manages any admin resource: search, list, create, edit and
 * delete. Behaviour is entirely driven by RESOURCES[resourceKey].
 */
export default function AdminResource({ resourceKey }) {
    const config = RESOURCES[resourceKey];

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notice, setNotice] = useState('');

    const [editing, setEditing] = useState(null); // null = closed, {} = new
    const [values, setValues] = useState({});
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState('');

    const [refs, setRefs] = useState({});

    const refKeys = useMemo(
        () => Array.from(new Set(config.fields.filter((f) => f.type === 'ref').map((f) => f.refKey))),
        [config.fields]
    );

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const query = search ? `?search=${encodeURIComponent(search)}` : '';
            const response = await apiGet(`${config.endpoint}${query}`, { auth: 'admin' });
            setItems(response.items || []);
            setTotal(response.total || 0);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [config.endpoint, search]);

    // Debounced so typing in the search box does not fire a request per keystroke.
    useEffect(() => {
        const timer = setTimeout(load, search ? 300 : 0);
        return () => clearTimeout(timer);
    }, [load, search]);

    // Lookup lists for any `ref` fields on this resource.
    useEffect(() => {
        if (refKeys.length === 0) return;

        let cancelled = false;

        Promise.all(
            refKeys.map(async (key) => {
                const source = REF_SOURCES[key];
                const response = await apiGet(source.endpoint, { auth: 'admin' });
                return [key, response.items || []];
            })
        )
            .then((entries) => {
                if (!cancelled) setRefs(Object.fromEntries(entries));
            })
            .catch((err) => console.error('Failed to load reference data:', err));

        return () => {
            cancelled = true;
        };
    }, [refKeys]);

    const openNew = () => {
        setEditing({});
        setValues(emptyRecord(config.fields));
        setFormError('');
    };

    const openEdit = (record) => {
        setEditing(record);
        setValues(toFormValues(record, config.fields));
        setFormError('');
    };

    const closeForm = () => {
        setEditing(null);
        setValues({});
        setFormError('');
    };

    const setField = (name) => (event) => {
        const { type, checked, value } = event.target;
        setValues((previous) => ({ ...previous, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setSaving(true);
        setFormError('');

        try {
            const payload = toPayload(values, config.fields);

            if (editing && editing._id) {
                await apiPut(`${config.endpoint}/${editing._id}`, payload, { auth: 'admin' });
                setNotice(`Saved changes to this ${config.singular}.`);
            } else {
                await apiPost(config.endpoint, payload, { auth: 'admin' });
                setNotice(`New ${config.singular} created — it is live on the storefront now.`);
            }

            closeForm();
            await load();
            setTimeout(() => setNotice(''), 4000);
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (record) => {
        const label = record.name || record.title || record.question || record.CategoryName || 'this entry';
        // eslint-disable-next-line no-alert -- deliberate confirmation before a destructive action
        if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return;

        try {
            await apiDelete(`${config.endpoint}/${record._id}`, { auth: 'admin' });
            setNotice(`Deleted "${label}".`);
            await load();
            setTimeout(() => setNotice(''), 4000);
        } catch (err) {
            setError(err.message);
        }
    };

    const renderField = (field) => {
        const id = `field-${field.name}`;
        const common = { id, value: values[field.name] ?? '', onChange: setField(field.name) };

        if (field.type === 'checkbox') {
            return (
                <div key={field.name} className="admin-field checkbox">
                    <input id={id} type="checkbox" checked={Boolean(values[field.name])} onChange={setField(field.name)} />
                    <label htmlFor={id}>{field.label}</label>
                </div>
            );
        }

        return (
            <div key={field.name} className={`admin-field ${field.full ? 'full' : ''}`}>
                <label htmlFor={id}>
                    {field.label}
                    {field.required && ' *'}
                </label>

                {field.type === 'textarea' && <textarea {...common} rows={field.rows || 5} required={field.required} />}

                {field.type === 'select' && (
                    <select {...common} required={field.required}>
                        {field.options.map((option) => (
                            <option key={option} value={option}>
                                {option.replace(/_/g, ' ')}
                            </option>
                        ))}
                    </select>
                )}

                {field.type === 'ref' && (
                    <select {...common} required={field.required}>
                        <option value="">— none —</option>
                        {(refs[field.refKey] || []).map((row) => {
                            const source = REF_SOURCES[field.refKey];
                            return (
                                <option key={row._id} value={source.valueOf(row)}>
                                    {source.labelOf(row)}
                                </option>
                            );
                        })}
                    </select>
                )}

                {(field.type === 'text' || field.type === 'csv') && (
                    <input {...common} type="text" required={field.required} />
                )}

                {field.type === 'number' && (
                    <input
                        {...common}
                        type="number"
                        step={field.step || '1'}
                        min={field.min}
                        max={field.max}
                        required={field.required}
                    />
                )}

                {field.hint && <span className="admin-field-hint">{field.hint}</span>}
            </div>
        );
    };

    return (
        <>
            <header className="admin-topbar">
                <div>
                    <h1>{config.title}</h1>
                    <p className="admin-topbar-sub">{config.subtitle}</p>
                </div>
                <div className="admin-topbar-actions">
                    <button type="button" className="admin-btn" onClick={openNew}>
                        <i className="fas fa-plus" aria-hidden="true"></i> New {config.singular}
                    </button>
                </div>
            </header>

            <div className="admin-content">
                {notice && (
                    <div className="admin-alert success">
                        <i className="fas fa-circle-check"></i> {notice}
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        <i className="fas fa-circle-exclamation"></i> {error}
                    </div>
                )}

                <div className="admin-toolbar">
                    <input
                        className="admin-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={config.searchPlaceholder}
                        aria-label={config.searchPlaceholder}
                    />
                    <span className="admin-field-hint">
                        {loading ? 'Loading…' : `${items.length} shown of ${total}`}
                    </span>
                    <button type="button" className="admin-btn ghost small" onClick={load}>
                        <i className="fas fa-rotate" aria-hidden="true"></i> Refresh
                    </button>
                </div>

                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {config.columns.map((column) => (
                                    <th key={column.key}>{column.label}</th>
                                ))}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={config.columns.length + 1} style={{ textAlign: 'center', padding: '2.5rem' }}>
                                        Nothing here yet.
                                    </td>
                                </tr>
                            )}

                            {items.map((row) => (
                                <tr key={row._id}>
                                    {config.columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render ? column.render(row) : String(row[column.key] ?? '—')}
                                        </td>
                                    ))}
                                    <td>
                                        <div className="admin-row-actions">
                                            <button type="button" className="admin-btn ghost small" onClick={() => openEdit(row)}>
                                                Edit
                                            </button>
                                            <button type="button" className="admin-btn danger small" onClick={() => handleDelete(row)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {editing !== null && (
                <div
                    className="admin-modal-overlay"
                    onClick={(event) => {
                        if (event.target === event.currentTarget) closeForm();
                    }}
                    role="presentation"
                >
                    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={`${editing._id ? 'Edit' : 'New'} ${config.singular}`}>
                        <div className="admin-modal-head">
                            <h2>
                                {editing._id ? 'Edit' : 'New'} {config.singular}
                            </h2>
                            <button type="button" className="admin-modal-close" onClick={closeForm} aria-label="Close">
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSave}>
                            {formError && (
                                <div className="admin-alert error" style={{ margin: '1.25rem 1.75rem 0' }}>
                                    <i className="fas fa-circle-exclamation"></i> {formError}
                                </div>
                            )}

                            <div className="admin-form">{config.fields.map(renderField)}</div>

                            <div className="admin-modal-foot">
                                <button type="button" className="admin-btn ghost" onClick={closeForm}>
                                    Cancel
                                </button>
                                <button type="submit" className="admin-btn" disabled={saving}>
                                    {saving ? <span className="admin-spinner"></span> : 'Save'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
