import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * CustomDropdown - A fully styled dropdown that works consistently across all platforms
 * Windows browsers ignore CSS on native <option> elements, so this uses divs instead.
 */
const CustomDropdown = ({
    value,
    onChange,
    options,
    placeholder = "Select an option...",
    disabled = false,
    isOpen: controlledIsOpen, // Optional controlled state
    onToggle // Optional callback for controlled state
}) => {
    const [localIsOpen, setLocalIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);

    const toggleOpen = (newState) => {
        const nextState = typeof newState === 'boolean' ? newState : !isOpen;

        // Check if should open upward when opening
        if (nextState && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = Math.min(300, options.length * 50 + 20);
            setOpenUpward(spaceBelow < menuHeight);
        }

        if (controlledIsOpen !== undefined) {
            if (onToggle) onToggle(nextState);
        } else {
            setLocalIsOpen(nextState);
            if (onToggle) onToggle(nextState);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                toggleOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                toggleOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        toggleOpen(false);
    };

    // Find the selected option's label (handles both string options and object options)
    const getSelectedLabel = () => {
        if (!value) return placeholder;

        const selectedOption = options.find(opt => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            return optValue === value;
        });

        if (selectedOption) {
            return typeof selectedOption === 'object' ? selectedOption.label : selectedOption;
        }
        return value; // Fallback to value itself if not found
    };

    const selectedLabel = getSelectedLabel();
    const isPlaceholder = !value;

    return (
        <div
            ref={dropdownRef}
            className="custom-dropdown"
            style={{
                position: 'relative',
                width: '100%',
                zIndex: isOpen ? 100 : 1, // Dynamically lift container when open
            }}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && toggleOpen(!isOpen)}
                disabled={disabled}
                className="custom-dropdown-trigger"
                style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1.5rem',
                    backgroundColor: 'var(--bg-card)',
                    border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                    borderRadius: '12px',
                    color: isPlaceholder ? 'var(--text-muted)' : 'var(--text-main)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    opacity: disabled ? 0.6 : 1,
                    boxShadow: isOpen ? 'var(--shadow-glow)' : 'var(--shadow-sm)',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                }}
                onMouseEnter={(e) => {
                    if (!disabled && !isOpen) {
                        e.target.style.borderColor = 'var(--primary-light)';
                        e.target.style.backgroundColor = 'var(--bg-subtle)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!disabled && !isOpen) {
                        e.target.style.borderColor = 'var(--border-light)';
                        e.target.style.backgroundColor = 'var(--bg-card)';
                    }
                }}
            >
                {selectedLabel}
            </button>

            {/* Chevron Icon */}
            <div
                style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
                    pointerEvents: 'none',
                    color: isOpen ? 'var(--primary)' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                }}
            >
                <ChevronDown size={18} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="custom-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-light)',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 9999, // Ensure it's on top
                        maxHeight: '250px',
                        overflowY: 'auto',
                        animation: 'dropdownFadeIn 0.2s ease-out',
                        backdropFilter: 'blur(20px)',
                        padding: '8px'
                    }}
                >
                    {options.map((option, index) => {
                        const optionValue = typeof option === 'object' ? option.value : option;
                        const optionLabel = typeof option === 'object' ? option.label : option;
                        const isSelected = value === optionValue;
                        const isDisabled = typeof option === 'object' && option.disabled;

                        return (
                            <div
                                key={optionValue || index}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isDisabled) handleSelect(optionValue);
                                }}
                                style={{
                                    padding: '12px 16px',
                                    color: isDisabled ? 'var(--text-muted)' : (isSelected ? 'var(--primary-dark)' : 'var(--text-main)'),
                                    backgroundColor: isSelected ? 'var(--primary-dim)' : 'transparent',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    border: '1px solid',
                                    borderColor: isSelected ? 'var(--primary-light)' : 'transparent',
                                    borderRadius: '10px',
                                    marginBottom: '4px',
                                    fontSize: '0.95rem',
                                    fontWeight: isSelected ? '600' : '500',
                                    fontFamily: 'inherit',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDisabled && !isSelected) {
                                        e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                                        e.currentTarget.style.borderColor = 'var(--border-light)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDisabled) {
                                        e.currentTarget.style.backgroundColor = isSelected ? 'var(--primary-dim)' : 'transparent';
                                        e.currentTarget.style.borderColor = isSelected ? 'var(--primary-light)' : 'transparent';
                                    }
                                }}
                            >
                                {optionLabel}
                                {isSelected && (
                                    <span style={{ color: 'var(--primary)' }}>✓</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
