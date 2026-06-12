import { useEffect, useMemo, useRef, useState } from 'react'
import { uploadReferenceImages } from '../api/uploadsApi'
import { orderToFormState } from '../utils/orderFormUtils'
import './CakeOrderForm.css'

const FLAVORS = [
  { value: 'black_forest', label: 'Black Forest' },
  { value: 'strawberry', label: 'Strawberry' },
  { value: 'mango', label: 'Mango' },
  { value: 'custom', label: 'Custom' },
]

const SIZES = [
  { value: '1 lb', label: '1 lb' },
  { value: '2 lb', label: '2 lb' },
  { value: '4 lb', label: '4 lb' },
  { value: '6 lb', label: '6 lb' },
  { value: '8 lb', label: '8 lb' },
  { value: 'custom', label: 'Custom' },
]

const ORDER_TYPES = [
  { value: 'pickup', label: 'Pick up' },
  { value: 'delivery', label: 'Delivery' },
]

const SIZE_PRICES = {
  '1 lb': 30,
  '2 lb': 60,
  '4 lb': 120,
  '6 lb': 180,
  '8 lb': 240,
}

const initialFormState = {
  customerName: '',
  flavor: '',
  customFlavor: '',
  size: '',
  customSize: '',
  orderType: 'pickup',
  pickupDate: '',
  pickupTime: '',
  deliveryDate: '',
  deliveryTime: '',
  deliveryAddress: '',
  total: '',
  advancePaid: '',
  orderTakenBy: '',
  greetings: '',
  modifications: '',
  referenceImageItems: [],
}

function isBlobPreviewUrl(url) {
  return typeof url === 'string' && url.startsWith('blob:')
}

function revokeBlobUrls(items) {
  items.forEach((item) => {
    if (item.source === 'new' && isBlobPreviewUrl(item.url)) {
      URL.revokeObjectURL(item.url)
    }
  })
}

export default function CakeOrderForm({ mode = 'create', initialOrder, onCancel, onSave }) {
  const [form, setForm] = useState(() =>
    initialOrder ? orderToFormState(initialOrder) : initialFormState,
  )
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const referenceImageItemsRef = useRef(form.referenceImageItems)

  const isPickup = form.orderType === 'pickup'

  useEffect(() => {
    referenceImageItemsRef.current = form.referenceImageItems
  }, [form.referenceImageItems])

  useEffect(() => {
    return () => {
      revokeBlobUrls(referenceImageItemsRef.current)
    }
  }, [])

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
    if (!form.size || form.size === 'custom') {
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

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handleOrderTypeChange(value) {
    setForm((current) => ({
      ...current,
      orderType: value,
      pickupDate: value === 'pickup' ? current.pickupDate : '',
      pickupTime: value === 'pickup' ? current.pickupTime : '',
      deliveryDate: value === 'delivery' ? current.deliveryDate : '',
      deliveryTime: value === 'delivery' ? current.deliveryTime : '',
      deliveryAddress: value === 'delivery' ? current.deliveryAddress : '',
    }))
    setErrors({})
  }

  function handleImageChange(event) {
    const files = Array.from(event.target.files ?? [])
    if (!files.length) return

    const newItems = files.map((file) => ({
      id: `new-${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      source: 'new',
      url: URL.createObjectURL(file),
      file,
      name: file.name,
    }))

    setForm((current) => ({
      ...current,
      referenceImageItems: [...current.referenceImageItems, ...newItems],
    }))
    event.target.value = ''
  }

  function removeReferenceImage(id) {
    setForm((current) => {
      const item = current.referenceImageItems.find((entry) => entry.id === id)
      if (item?.source === 'new' && isBlobPreviewUrl(item.url)) {
        URL.revokeObjectURL(item.url)
      }

      return {
        ...current,
        referenceImageItems: current.referenceImageItems.filter((entry) => entry.id !== id),
      }
    })
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
    } else if (form.size === 'custom' && !form.customSize.trim()) {
      nextErrors.customSize = 'Enter a custom size'
    }

    if (!form.orderType) {
      nextErrors.orderType = 'Please select an order type'
    }

    if (isPickup) {
      if (!form.pickupDate) {
        nextErrors.pickupDate = 'Pick up date is required'
      }
      if (!form.pickupTime) {
        nextErrors.pickupTime = 'Pick up time is required'
      }
    } else {
      if (!form.deliveryDate) {
        nextErrors.deliveryDate = 'Delivery date is required'
      }
      if (!form.deliveryTime) {
        nextErrors.deliveryTime = 'Delivery time is required'
      }
      if (!form.deliveryAddress.trim()) {
        nextErrors.deliveryAddress = 'Delivery address is required'
      }
    }

    if (form.total === '' || Number.isNaN(parseFloat(form.total))) {
      nextErrors.total = 'Total amount is required'
    }

    if (form.advancePaid === '' || Number.isNaN(parseFloat(form.advancePaid))) {
      nextErrors.advancePaid = 'Advance paid is required'
    }

    if (!form.orderTakenBy.trim()) {
      nextErrors.orderTakenBy = 'Order taken by is required'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validate()) {
      return
    }

    setIsSaving(true)
    setSubmitError(null)
    try {
      const existingUrls = form.referenceImageItems
        .filter((item) => item.source === 'existing')
        .map((item) => item.url)

      const newFiles = form.referenceImageItems
        .filter((item) => item.source === 'new')
        .map((item) => item.file)

      let uploadedUrls = []
      if (newFiles.length) {
        const uploads = await uploadReferenceImages(newFiles)
        uploadedUrls = uploads.map((upload) => upload.url)
      }

      const referenceImages = [...existingUrls, ...uploadedUrls]
      const referenceImageName = referenceImages.length
        ? form.referenceImageItems[0]?.name ?? null
        : null

      const order = {
        customerName: form.customerName.trim(),
        flavor:
          form.flavor === 'custom'
            ? form.customFlavor.trim()
            : FLAVORS.find((item) => item.value === form.flavor)?.label ?? form.flavor,
        size: form.size === 'custom' ? form.customSize.trim() : form.size,
        orderType: form.orderType,
        pickupDate: isPickup ? form.pickupDate : '',
        pickupTime: isPickup ? form.pickupTime : '',
        deliveryDate: isPickup ? '' : form.deliveryDate,
        deliveryTime: isPickup ? '' : form.deliveryTime,
        deliveryAddress: isPickup ? '' : form.deliveryAddress.trim(),
        total: parseFloat(form.total),
        advancePaid: parseFloat(form.advancePaid),
        pending: parseFloat(pending),
        orderTakenBy: form.orderTakenBy.trim(),
        greetings: form.greetings.trim(),
        modifications: form.modifications.trim(),
        referenceImageName,
        referenceImages,
      }

      await onSave?.(order)
    } catch (err) {
      setSubmitError(err.message ?? 'Failed to save order')
    } finally {
      setIsSaving(false)
    }
  }

  function handleReset() {
    revokeBlobUrls(form.referenceImageItems)

    setForm(initialOrder ? orderToFormState(initialOrder) : initialFormState)
    setErrors({})
  }

  return (
    <div className="cake-order-form-body">
      <form className="cake-order-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
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
                <label key={size.value} className="radio-option">
                  <input
                    type="radio"
                    name="size"
                    value={size.value}
                    checked={form.size === size.value}
                    onChange={(event) => updateField('size', event.target.value)}
                  />
                  <span>{size.label}</span>
                </label>
              ))}
            </div>
            {form.size === 'custom' && (
              <input
                className="custom-flavor-input"
                type="text"
                value={form.customSize}
                onChange={(event) => updateField('customSize', event.target.value)}
                placeholder="e.g. 10 lb"
                aria-invalid={Boolean(errors.customSize)}
              />
            )}
            {errors.size && <p className="error">{errors.size}</p>}
            {errors.customSize && <p className="error">{errors.customSize}</p>}
          </fieldset>

          <fieldset className="field">
            <legend>
              Order Type <span className="required">*</span>
            </legend>
            <div className="radio-group order-type-group">
              {ORDER_TYPES.map((type) => (
                <label key={type.value} className="radio-option">
                  <input
                    type="radio"
                    name="orderType"
                    value={type.value}
                    checked={form.orderType === type.value}
                    onChange={(event) => handleOrderTypeChange(event.target.value)}
                  />
                  <span>{type.label}</span>
                </label>
              ))}
            </div>
            {errors.orderType && <p className="error">{errors.orderType}</p>}
          </fieldset>

          {isPickup ? (
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
          ) : (
            <>
              <div className="field-row">
                <div className="field">
                  <label htmlFor="deliveryDate">
                    Delivery Date <span className="required">*</span>
                  </label>
                  <input
                    id="deliveryDate"
                    type="date"
                    value={form.deliveryDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(event) => updateField('deliveryDate', event.target.value)}
                    aria-invalid={Boolean(errors.deliveryDate)}
                  />
                  {errors.deliveryDate && <p className="error">{errors.deliveryDate}</p>}
                </div>

                <div className="field">
                  <label htmlFor="deliveryTime">
                    Delivery Time <span className="required">*</span>
                  </label>
                  <div className="time-input-wrapper">
                    <span className="clock-icon" aria-hidden="true">
                      🕐
                    </span>
                    <input
                      id="deliveryTime"
                      type="time"
                      value={form.deliveryTime}
                      onChange={(event) => updateField('deliveryTime', event.target.value)}
                      aria-invalid={Boolean(errors.deliveryTime)}
                    />
                  </div>
                  {errors.deliveryTime && <p className="error">{errors.deliveryTime}</p>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="deliveryAddress">
                  Delivery Address <span className="required">*</span>
                </label>
                <textarea
                  id="deliveryAddress"
                  rows={3}
                  value={form.deliveryAddress}
                  onChange={(event) => updateField('deliveryAddress', event.target.value)}
                  placeholder="Enter full delivery address"
                  aria-invalid={Boolean(errors.deliveryAddress)}
                />
                {errors.deliveryAddress && <p className="error">{errors.deliveryAddress}</p>}
              </div>
            </>
          )}

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
              <label htmlFor="pending">
                Pending <span className="optional-tag">(optional)</span>
              </label>
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

          <div className="field">
            <label htmlFor="orderTakenBy">
              Order Taken By <span className="required">*</span>
            </label>
            <input
              id="orderTakenBy"
              type="text"
              value={form.orderTakenBy}
              onChange={(event) => updateField('orderTakenBy', event.target.value)}
              placeholder="Enter staff name"
              aria-invalid={Boolean(errors.orderTakenBy)}
            />
            {errors.orderTakenBy && <p className="error">{errors.orderTakenBy}</p>}
          </div>

          <div className="field">
            <label htmlFor="greetings">
              Greetings <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="greetings"
              rows={3}
              value={form.greetings}
              onChange={(event) => updateField('greetings', event.target.value)}
              placeholder="Happy Birthday, Congratulations, etc."
            />
          </div>

          <div className="field">
            <label htmlFor="referenceImages">
              Reference Images <span className="optional-tag">(optional)</span>
            </label>
            <input
              id="referenceImages"
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            {form.referenceImageItems.length ? (
              <div className="image-preview-list">
                {form.referenceImageItems.map((item) => (
                  <div key={item.id} className="image-preview">
                    <img src={item.url} alt={item.name} />
                    <div className="image-preview-meta">
                      <p>{item.name}</p>
                      <button
                        type="button"
                        className="image-preview-remove"
                        onClick={() => removeReferenceImage(item.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="field">
            <label htmlFor="modifications">
              Modifications <span className="optional-tag">(optional)</span>
            </label>
            <textarea
              id="modifications"
              rows={3}
              value={form.modifications}
              onChange={(event) => updateField('modifications', event.target.value)}
              placeholder="Special design notes, toppings, eggless, etc."
            />
          </div>
        </section>

        {submitError ? <p className="error form-submit-error">{submitError}</p> : null}

        <div className="form-actions">
          {onCancel ? (
            <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </button>
          ) : null}
          <button type="button" className="btn-secondary" onClick={handleReset} disabled={isSaving}>
            Reset
          </button>
          <button type="submit" className="btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : mode === 'edit' ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </form>
    </div>
  )
}
