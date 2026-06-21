import { useEffect, useMemo, useRef, useState } from 'react'
import dayjs from 'dayjs'
import FormControl from '@mui/material/FormControl'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { DesktopTimePicker } from '@mui/x-date-pickers/DesktopTimePicker'
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { uploadReferenceImages } from '../api/uploadsApi'
import ConfirmDialog from './ConfirmDialog'
import ReferenceImageLightbox from './ReferenceImageLightbox'
import { orderToFormState } from '../utils/orderFormUtils'
import { formatCurrency, getPreparationStatusOptions } from '../utils/orderUtils'
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
const PICKER_HIGHLIGHT = 'rgb(184 146 42 / 34%)'

const initialFormState = {
  customerName: '',
  customerPhoneNumber: '',
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
  preparationStatus: 'in_progress',
}

function formatPhoneNumberInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  const first = digits.slice(0, 3)
  const second = digits.slice(3, 6)
  const third = digits.slice(6, 10)

  if (!first) return ''
  if (digits.length <= 3) return `(${first}`
  if (digits.length <= 6) return `(${first}) ${second}`
  return `(${first}) ${second} - ${third}`
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

function toDateValue(value) {
  if (!value) return null
  const parsed = dayjs(value)
  return parsed.isValid() ? parsed : null
}

function toTimeValue(value) {
  if (!value) return null
  const parsed = dayjs(`2000-01-01T${value}`)
  return parsed.isValid() ? parsed : null
}

function getPickerTextFieldProps(errorMessage) {
  return {
    fullWidth: true,
    error: Boolean(errorMessage),
    helperText: errorMessage || undefined,
  }
}

function getPickerPopperSx() {
  return {
    '& .MuiPickersDay-root.Mui-selected, & .MuiPickersDay-root.Mui-selected:hover, & .MuiPickersDay-root.Mui-selected:focus': {
      backgroundColor: `${PICKER_HIGHLIGHT} !important`,
      color: 'var(--rr-black) !important',
    },
    '& .MuiMultiSectionDigitalClockSection-item.Mui-selected, & .MuiMultiSectionDigitalClockSection-item.Mui-selected:hover': {
      backgroundColor: `${PICKER_HIGHLIGHT} !important`,
      color: 'var(--rr-black) !important',
    },
    '& .MuiClockNumber-root.Mui-selected, & .MuiClockNumber-root.Mui-selected:hover': {
      backgroundColor: `${PICKER_HIGHLIGHT} !important`,
      color: 'var(--rr-black) !important',
    },
    '& .MuiClock-pin, & .MuiClockPointer-root, & .MuiClockPointer-thumb': {
      backgroundColor: `${PICKER_HIGHLIGHT} !important`,
      borderColor: `${PICKER_HIGHLIGHT} !important`,
    },
  }
}

function getAdvanceAmountError(totalRaw, advanceRaw) {
  const totalValue = parseFloat(totalRaw)
  const advanceValue = parseFloat(advanceRaw)
  if (Number.isNaN(totalValue) || Number.isNaN(advanceValue)) return undefined
  if (advanceValue > totalValue) return 'Advance cannot exceed total'
  return undefined
}

export default function CakeOrderForm({ mode = 'create', initialOrder, onCancel, onSave }) {
  const [form, setForm] = useState(() =>
    initialOrder ? orderToFormState(initialOrder) : initialFormState,
  )
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [imagePendingDelete, setImagePendingDelete] = useState(null)
  const referenceImageItemsRef = useRef(form.referenceImageItems)

  const isPickup = form.orderType === 'pickup'
  const preparationStatusOptions = useMemo(
    () => getPreparationStatusOptions(form.orderType),
    [form.orderType],
  )

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

  const pending = useMemo(() => {
    const total = parseFloat(form.total)
    const advance = parseFloat(form.advancePaid)

    if (Number.isNaN(total) || Number.isNaN(advance)) {
      return ''
    }

    return Math.max(total - advance, 0).toFixed(2)
  }, [form.total, form.advancePaid])

  const lightboxImages = useMemo(
    () =>
      form.referenceImageItems.map((item) => ({
        src: item.url,
        alt: item.name,
      })),
    [form.referenceImageItems],
  )

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function handlePhoneNumberChange(value) {
    updateField('customerPhoneNumber', formatPhoneNumberInput(value))
  }

  function handlePaymentFieldChange(field, value) {
    const nextForm = { ...form, [field]: value }
    const advanceAmountError = getAdvanceAmountError(nextForm.total, nextForm.advancePaid)
    setForm(nextForm)
    setErrors((current) => ({
      ...current,
      total: undefined,
      advancePaid: advanceAmountError,
    }))
  }

  function handleOrderTypeChange(value) {
    const nextStatusOptions = getPreparationStatusOptions(value)
    const currentStatusIsAllowed = nextStatusOptions.some(
      (option) => option.value === form.preparationStatus,
    )
    setForm((current) => ({
      ...current,
      orderType: value,
      pickupDate: value === 'pickup' ? current.pickupDate : '',
      pickupTime: value === 'pickup' ? current.pickupTime : '',
      deliveryDate: value === 'delivery' ? current.deliveryDate : '',
      deliveryTime: value === 'delivery' ? current.deliveryTime : '',
      deliveryAddress: value === 'delivery' ? current.deliveryAddress : '',
      preparationStatus: currentStatusIsAllowed
        ? current.preparationStatus
        : nextStatusOptions[0].value,
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
    setLightboxIndex(null)
    setImagePendingDelete(null)
  }

  function handleConfirmRemoveImage() {
    if (imagePendingDelete) {
      removeReferenceImage(imagePendingDelete.id)
    }
  }

  function validate() {
    const nextErrors = {}

    if (!form.customerName.trim()) {
      nextErrors.customerName = 'Customer name is required'
    }
    if (!form.customerPhoneNumber.trim()) {
      nextErrors.customerPhoneNumber = 'Customer phone number is required'
    } else if (!/^\(\d{3}\)\s\d{3}\s-\s\d{4}$/.test(form.customerPhoneNumber.trim())) {
      nextErrors.customerPhoneNumber = 'Use format: (555) 123 - 4567'
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

    const totalValue = parseFloat(form.total)
    const advancePaidValue = parseFloat(form.advancePaid)

    if (form.total === '' || Number.isNaN(totalValue)) {
      nextErrors.total = 'Total amount is required'
    }

    if (form.advancePaid === '' || Number.isNaN(advancePaidValue)) {
      nextErrors.advancePaid = 'Advance paid is required'
    } else if (!Number.isNaN(totalValue) && advancePaidValue > totalValue) {
      nextErrors.advancePaid = 'Advance cannot exceed total'
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
        customerPhoneNumber: form.customerPhoneNumber.trim(),
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
        preparationStatus: form.preparationStatus,
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
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <form className="cake-order-form" onSubmit={handleSubmit} noValidate>
        <section className="form-section">
          <div className="field-row customer-row">
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
            <div className="field">
              <label htmlFor="customerPhoneNumber">
                Customer Phone Number <span className="required">*</span>
              </label>
              <input
                id="customerPhoneNumber"
                type="tel"
                value={form.customerPhoneNumber}
                onChange={(event) => handlePhoneNumberChange(event.target.value)}
                placeholder="(555) 123 - 4567"
                maxLength={16}
                aria-invalid={Boolean(errors.customerPhoneNumber)}
              />
              {errors.customerPhoneNumber ? (
                <p className="error">{errors.customerPhoneNumber}</p>
              ) : null}
            </div>
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

          {mode === 'edit' ? (
            <div className="field-row status-order-row">
              <div className="field">
                <label htmlFor="preparationStatus">
                  Status <span className="required">*</span>
                </label>
                <FormControl size="small" fullWidth>
                  <Select
                    id="preparationStatus"
                    value={form.preparationStatus}
                    onChange={(event) => updateField('preparationStatus', event.target.value)}
                    aria-label="Order preparation status"
                    sx={{
                      '& .MuiSelect-select': {
                        py: '0.62rem',
                        pl: '0.85rem',
                        pr: '2.25rem',
                      },
                      '& .MuiSelect-icon': {
                        right: '0.6rem',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: '10px',
                          '& .MuiMenuItem-root': {
                            '&.Mui-selected': {
                              backgroundColor: `${PICKER_HIGHLIGHT} !important`,
                              color: 'var(--rr-black)',
                            },
                            '&.Mui-selected:hover': {
                              backgroundColor: `${PICKER_HIGHLIGHT} !important`,
                            },
                            '&:hover': {
                              backgroundColor: `${PICKER_HIGHLIGHT} !important`,
                            },
                          },
                        },
                      },
                    }}
                  >
                    {preparationStatusOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
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
            </div>
          ) : null}

          {isPickup ? (
            <div className="field-row date-time-row">
              <div className="field">
                <label htmlFor="pickupDate">
                  Pick Up Date <span className="required">*</span>
                </label>
                <DatePicker
                  id="pickupDate"
                  value={toDateValue(form.pickupDate)}
                  onChange={(value) => updateField('pickupDate', value ? value.format('YYYY-MM-DD') : '')}
                  minDate={dayjs().startOf('day')}
                  format="MM/DD/YYYY"
                  slotProps={{
                    textField: getPickerTextFieldProps(errors.pickupDate),
                    popper: { sx: getPickerPopperSx() },
                  }}
                />
              </div>

              <div className="field">
                <label htmlFor="pickupTime">
                  Pick Up Time <span className="required">*</span>
                </label>
                <DesktopTimePicker
                  id="pickupTime"
                  value={toTimeValue(form.pickupTime)}
                  onChange={(value) => updateField('pickupTime', value ? value.format('HH:mm') : '')}
                  ampm
                  minutesStep={5}
                  viewRenderers={{
                    hours: renderTimeViewClock,
                    minutes: renderTimeViewClock,
                  }}
                  slotProps={{
                    textField: getPickerTextFieldProps(errors.pickupTime),
                    popper: { sx: getPickerPopperSx() },
                  }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="field-row date-time-row">
                <div className="field">
                  <label htmlFor="deliveryDate">
                    Delivery Date <span className="required">*</span>
                  </label>
                  <DatePicker
                    id="deliveryDate"
                    value={toDateValue(form.deliveryDate)}
                    onChange={(value) =>
                      updateField('deliveryDate', value ? value.format('YYYY-MM-DD') : '')
                    }
                    minDate={dayjs().startOf('day')}
                    format="MM/DD/YYYY"
                    slotProps={{
                      textField: getPickerTextFieldProps(errors.deliveryDate),
                      popper: { sx: getPickerPopperSx() },
                    }}
                  />
                </div>

                <div className="field">
                  <label htmlFor="deliveryTime">
                    Delivery Time <span className="required">*</span>
                  </label>
                  <DesktopTimePicker
                    id="deliveryTime"
                    value={toTimeValue(form.deliveryTime)}
                    onChange={(value) => updateField('deliveryTime', value ? value.format('HH:mm') : '')}
                    ampm
                    minutesStep={5}
                    viewRenderers={{
                      hours: renderTimeViewClock,
                      minutes: renderTimeViewClock,
                    }}
                    slotProps={{
                      textField: getPickerTextFieldProps(errors.deliveryTime),
                      popper: { sx: getPickerPopperSx() },
                    }}
                  />
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
                onChange={(event) => handlePaymentFieldChange('total', event.target.value)}
                placeholder="$0.00"
                aria-invalid={Boolean(errors.total)}
              />
              <p className={`error payment-error${errors.total ? '' : ' is-empty'}`}>
                {errors.total || ' '}
              </p>
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
                onChange={(event) => handlePaymentFieldChange('advancePaid', event.target.value)}
                placeholder="$0.00"
                aria-invalid={Boolean(errors.advancePaid)}
              />
              <p className={`error payment-error${errors.advancePaid ? '' : ' is-empty'}`}>
                {errors.advancePaid || ' '}
              </p>
            </div>

            <div className="field">
              <label htmlFor="pending">
                Pending <span className="optional-tag">(optional)</span>
              </label>
              <input
                id="pending"
                type="text"
                value={pending ? formatCurrency(pending) : ''}
                readOnly
                className="readonly-field"
                placeholder="Auto-calculated"
              />
              <p className="error payment-error is-empty"> </p>
            </div>
          </div>

          {mode !== 'edit' ? (
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
          ) : null}

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
                {form.referenceImageItems.map((item, index) => (
                  <div key={item.id} className="image-preview">
                    <div className="image-preview-toolbar">
                      <span className="image-preview-name" title={item.name}>
                        {item.name}
                      </span>
                      <button
                        type="button"
                        className="image-preview-delete"
                        onClick={() =>
                          setImagePendingDelete({ id: item.id, name: item.name })
                        }
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="18"
                          height="18"
                          aria-hidden="true"
                          focusable="false"
                        >
                          <path
                            fill="currentColor"
                            d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
                          />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      className="image-preview-image-button"
                      onClick={() => setLightboxIndex(index)}
                      aria-label={`View ${item.name}`}
                    >
                      <img src={item.url} alt={item.name} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}
            <ReferenceImageLightbox
              images={lightboxImages}
              openIndex={lightboxIndex}
              onClose={() => setLightboxIndex(null)}
            />
          </div>

          <div className="field">
            <label htmlFor="modifications">
              Instructions <span className="optional-tag">(optional)</span>
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
      </LocalizationProvider>

      {imagePendingDelete ? (
        <ConfirmDialog
          title="Remove this image?"
          message={`Are you sure you want to remove "${imagePendingDelete.name}"?`}
          confirmLabel="Remove"
          confirmVariant="danger"
          onConfirm={handleConfirmRemoveImage}
          onCancel={() => setImagePendingDelete(null)}
        />
      ) : null}
    </div>
  )
}
