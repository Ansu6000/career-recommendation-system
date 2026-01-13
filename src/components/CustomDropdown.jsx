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
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : localIsOpen;

    const toggleOpen = (newState) => {
        const nextState = typeof newState === 'boolean' ? newState : !isOpen;
        if (controlledIsOpen !== undefined) {
            if (onToggle) onToggle(nextState);
        } else {
            setLocalIsOpen(nextState);
            if (onToggle) onToggle(nextState);
        }
    };
    const dropdownRef = useRef(null);

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
                colorScheme: 'dark',
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
                    backgroundColor: 'var(--dropdown-bg, #0f172a)',
                    border: '1px solid var(--dropdown-border, rgba(255, 255, 255, 0.08))',
                    borderRadius: '12px',
                    color: isPlaceholder ? 'var(--dropdown-text-disabled, #64748b)' : 'var(--dropdown-text, #f1f5f9)',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    opacity: disabled ? 0.6 : 1,
                    colorScheme: 'dark',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = 'var(--dropdown-border-active, #60a5fa)';
                    e.target.style.boxShadow = '0 0 0 1px var(--dropdown-border-active, #60a5fa), 0 0 20px rgba(96, 165, 250, 0.15)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'var(--dropdown-border, rgba(255, 255, 255, 0.08))';
                    e.target.style.boxShadow = 'none';
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
                    color: 'var(--text-secondary, #94a3b8)',
                    transition: 'transform 0.2s ease',
                }}
            >
                <ChevronDown size={16} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    className="custom-dropdown-menu"
                    style={{
                        position: 'absolute',
                        top: 'calc(100% + 4px)',
                        left: 0,
                        right: 0,
                        backgroundColor: '#0f172a', // Enjoined solid background
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)', // Stronger shadow
                        zIndex: 9999, // Ensure it's on top
                        maxHeight: '250px',
                        overflowY: 'auto',
                        animation: 'dropdownFadeIn 0.15s ease-out',
                        colorScheme: 'dark',
                        backdropFilter: 'blur(20px)',
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
                                    color: isDisabled ? 'var(--dropdown-text-disabled, #64748b)' : 'var(--dropdown-text, #f1f5f9)',
                                    backgroundColor: isSelected ? 'var(--dropdown-bg-hover, rgba(96, 165, 250, 0.15))' : 'transparent',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.15s ease',
                                    borderBottom: index < options.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                    colorScheme: 'dark',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDisabled && !isSelected) {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDisabled) {
                                        e.target.style.backgroundColor = isSelected ? 'var(--dropdown-bg-hover, rgba(96, 165, 250, 0.15))' : 'transparent';
                                    }
                                }}
                            >
                                {optionLabel}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
