import { useEffect, useMemo, useState } from 'react'
import { orderToFormState } from '../utils/orderFormUtils'
import './CakeOrderForm.css'

const FLAVORS = [
  { value: 'black_forest', label: 'Black Forest' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'mango', label: 'Mango' },
  { value: 'custom', label: 'Custom' },
]

const SIZES = ['1 lb', '2 lb', '4 lb', '6 lb', '8 lb']

const SIZE_PRICES = {
  '1 lb': 500,
  '2 lb': 900,
  '4 lb': 1600,
  '6 lb': 2200,
  '8 lb': 2800,
}

const initialFormState = {
  customerName: '',
  flavor: '',
  customFlavor: '',
  size: '',
  pickupDate: '',
  pickupTime: '',
  total: '',
  advancePaid: '',
  greetings: '',
  modifications: '',
  referenceImage: null,
  referenceImagePreview: '',
}

export default function CakeOrderForm({ mode = 'create', initialOrder, onCancel, onSave }) {
  const [form, setForm] = useState(() =>
    initialOrder ? orderToFormState(initialOrder) : initialFormState,
  )
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initialOrder) {
      setForm(orderToFormState(initialOrder))
      setErrors({})
    }
  }, [initialOrder])

  const pending = useMemo(() => {
    const total = parseFloat(form.total)
    const advance = parseFloat(form.advancePaid)

    if (Number.isNaN(total) || Number.isNaN(advance)) {
      return ''
    }

    return Math.max(total - advance, 0).toFixed(2)
  }, [form.total, form.advancePaid])

  useEffect(() => {
    if (!form.size) {
      return
    }

    const suggestedTotal = SIZE_PRICES[form.size]
    if (suggestedTotal !== undefined) {
      setForm((current) => ({
        ...current,
        total: String(suggestedTotal),
      }))
    }
  }, [form.size])

  useEffect(() => {
    return () => {
      if (form.referenceImagePreview) {
        URL.revokeObjectURL(form.referenceImagePreview)
      }
    }
  }, [form.referenceImagePreview])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]

    if (!file) {
      updateField('referenceImage', null)
      updateField('referenceImagePreview', '')
      return
    }

    if (form.referenceImagePreview) {
      URL.revokeObjectURL(form.referenceImagePreview)
    }

    updateField('referenceImage', file)
    updateField('referenceImagePreview', URL.createObjectURL(file))
  }

  function validate() {
    const nextErrors = {}

    if (!form.customerName.trim()) {
      nextErrors.customerName = 'Customer name is required'
    }

    if (!form.flavor) {
      nextErrors.flavor = 'Please select a flavor'
    } else if (form.flavor === 'custom' && !form.customFlavor.trim()) {
      nextErrors.customFlavor = 'Enter a custom flavor'
    }

    if (!form.size) {
      nextErrors.size = 'Please select a cake size'
    }

    if (!form.pickupDate) {
      nextErrors.pickupDate = 'Pick up date is required'
    }

    if (!form.pickupTime) {
      nextErrors.pickupTime = 'Pick up time is required'
    }

    if (form.total === '' || Number.isNaN(parseFloat(form.total))) {
      nextErrors.total = 'Total amount is required'
    }

    if (form.advancePaid === '' || Number.isNaN(parseFloat(form.advancePaid))) {
      nextErrors.advancePaid = 'Advance paid is required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    const order = {
      customerName: form.customerName.trim(),
      flavor:
        form.flavor === 'custom'
          ? form.customFlavor.trim()
          : FLAVORS.find((item) => item.value === form.flavor)?.label ?? form.flavor,
      size: form.size,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      total: parseFloat(form.total),
      advancePaid: parseFloat(form.advancePaid),
      pending: parseFloat(pending),
      greetings: form.greetings.trim(),
      modifications: form.modifications.trim(),
      referenceImageName: form.referenceImage?.name ?? null,
    }

    onSave?.(order)
  }

  function handleReset() {
    if (form.referenceImagePreview) {
      URL.revokeObjectURL(form.referenceImagePreview)
    }

    setForm(initialOrder ? orderToFormState(initialOrder) : initialFormState)
    setErrors({})
  }

  return (
    <div className="cake-order-form-body">
      <form className="cake-order-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <h2>Mandatory Details</h2>

          <div className="field">
            <label htmlFor="customerName">
              Customer Name <span className="required">*</span>
            </label>
            <input
              id="customerName"
              type="text"
              value={form.customerName}
              onChange={(event) => updateField('customerName', event.target.value)}
              placeholder="Enter customer name"
              aria-invalid={Boolean(errors.customerName)}
            />
            {errors.customerName && <p className="error">{errors.customerName}</p>}
          </div>

          <fieldset className="field">
            <legend>
              Flavor of Cake <span className="required">*</span>
            </legend>
            <div className="radio-group">
              {FLAVORS.map((flavor) => (
                <label key={flavor.value} className="radio-option">
                  <input
                    type="radio"
                    name="flavor"
                    value={flavor.value}
                    checked={form.flavor === flavor.value}
                    onChange={(event) => updateField('flavor', event.target.value)}
                  />
                  <span>{flavor.label}</span>
                </label>
              ))}
            </div>
            {form.flavor === 'custom' && (
              <input
                className="custom-flavor-input"
                type="text"
                value={form.customFlavor}
                onChange={(event) => updateField('customFlavor', event.target.value)}
                placeholder="Enter custom flavor"
                aria-invalid={Boolean(errors.customFlavor)}
              />
            )}
            {errors.flavor && <p className="error">{errors.flavor}</p>}
            {errors.customFlavor && <p className="error">{errors.customFlavor}</p>}
          </fieldset>

          <fieldset className="field">
            <legend>
              Size of Cake <span className="required">*</span>
            </legend>
            <div className="radio-group size-group">
              {SIZES.map((size) => (
                <label key={size} className="radio-option">
                  <input
                    type="radio"
                    name="size"
                    value={size}
                    checked={form.size === size}
                    onChange={(event) => updateField('size', event.target.value)}
                  />
                  <span>{size}</span>
                </label>
              ))}
            </div>
            {errors.size && <p className="error">{errors.size}</p>}
          </fieldset>

          <div className="field-row">
            <div className="field">
              <label htmlFor="pickupDate">
                Pick Up Date <span className="required">*</span>
              </label>
              <input
                id="pickupDate"
                type="date"
                value={form.pickupDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(event) => updateField('pickupDate', event.target.value)}
                aria-invalid={Boolean(errors.pickupDate)}
              />
              {errors.pickupDate && <p className="error">{errors.pickupDate}</p>}
            </div>

            <div className="field">
              <label htmlFor="pickupTime">
                Pick Up Time <span className="required">*</span>
              </label>
              <div className="time-input-wrapper">
                <span className="clock-icon" aria-hidden="true">
                  🕐
                </span>
                <input
                  id="pickupTime"
                  type="time"
                  value={form.pickupTime}
                  onChange={(event) => updateField('pickupTime', event.target.value)}
                  aria-invalid={Boolean(errors.pickupTime)}
                />
              </div>
              {errors.pickupTime && <p className="error">{errors.pickupTime}</p>}
            </div>
          </div>

          <div className="field-row payment-row">
            <div className="field">
              <label htmlFor="total">
                Total <span className="required">*</span>
              </label>
              <input
                id="total"
                type="number"
                min="0"
                step="0.01"
                value={form.total}
                onChange={(event) => updateField('total', event.target.value)}
                placeholder="0.00"
                aria-invalid={Boolean(errors.total)}
              />
              {errors.total && <p className="error">{errors.total}</p>}
            </div>

            <div className="field">
              <label htmlFor="advancePaid">
                Advance Paid <span className="required">*</span>
              </label>
              <input
                id="advancePaid"
                type="number"
                min="0"
                step="0.01"
                value={form.advancePaid}
                onChange={(event) => updateField('advancePaid', event.target.value)}
                placeholder="0.00"
                aria-invalid={Boolean(errors.advancePaid)}
              />
              {errors.advancePaid && <p className="error">{errors.advancePaid}</p>}
            </div>

            <div className="field">
              <label htmlFor="pending">Pending</label>
              <input
                id="pending"
                type="text"
                value={pending || ''}
                readOnly
                className="readonly-field"
                placeholder="Auto-calculated"
              />
            </div>
          </div>
        </section>

        <section className="form-section optional-section">
          <h2>Optional Details</h2>

          <div className="field">
            <label htmlFor="greetings">Greetings</label>
            <textarea
              id="greetings"
              rows={3}
              value={form.greetings}
              onChange={(event) => updateField('greetings', event.target.value)}
              placeholder="Happy Birthday, Congratulations, etc."
            />
          </div>

          <div className="field">
            <label htmlFor="referenceImage">Reference Image</label>
            <input
              id="referenceImage"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {form.referenceImagePreview && (
              <div className="image-preview">
                <img src={form.referenceImagePreview} alt="Reference preview" />
                <p>{form.referenceImage?.name}</p>
              </div>
            )}
          </div>

          <div className="field">
            <label htmlFor="modifications">Modifications</label>
            <textarea
              id="modifications"
              rows={3}
              value={form.modifications}
              onChange={(event) => updateField('modifications', event.target.value)}
              placeholder="Special design notes, toppings, eggless, etc."
            />
          </div>
        </section>

        <div className="form-actions">
          {onCancel ? (
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          ) : null}
          <button type="button" className="btn-secondary" onClick={handleReset}>
            Reset
          </button>
          <button type="submit" className="btn-primary">
            {mode === 'edit' ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
