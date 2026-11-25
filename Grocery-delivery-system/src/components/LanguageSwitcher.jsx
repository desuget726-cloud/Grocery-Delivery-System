import { Check, ChevronDown, Languages } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LANGUAGES, useLanguage } from '../context/LanguageContext.jsx'

function LanguageSwitcher({ className = '', triggerClassName = '' }) {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const activeLanguage = LANGUAGES.find((item) => item.code === language)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`Language: ${activeLanguage.label}`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        className={
          triggerClassName ||
          'inline-flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-semibold transition hover:bg-black/5'
        }
      >
        <Languages aria-hidden="true" size={15} />
        <span>{activeLanguage.short}</span>
        <ChevronDown aria-hidden="true" size={12} />
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Select language"
          className="absolute right-0 top-full z-50 mt-1 w-40 rounded-xl border border-gray-100 bg-white p-1.5 text-gray-800 shadow-xl"
        >
          {LANGUAGES.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={language === code}
              onClick={() => {
                setLanguage(code)
                setOpen(false)
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-gray-50"
            >
              {label}
              {language === code && (
                <Check
                  aria-hidden="true"
                  size={15}
                  className="text-[#1E8E3E]"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
