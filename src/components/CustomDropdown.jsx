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
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
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
            }}
        >
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="custom-dropdown-trigger"
                style={{
                    width: '100%',
                    padding: '1rem 3rem 1rem 1.5rem',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '12px',
                    color: isPlaceholder ? '#64748b' : '#f1f5f9',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    textAlign: 'left',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    opacity: disabled ? 0.6 : 1,
                }}
                onFocus={(e) => {
                    e.target.style.borderColor = '#60a5fa';
                    e.target.style.boxShadow = '0 0 0 1px #60a5fa, 0 0 20px rgba(96, 165, 250, 0.15)';
                }}
                onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
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
                    color: '#94a3b8',
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
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        animation: 'dropdownFadeIn 0.15s ease-out',
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
                                onClick={() => !isDisabled && handleSelect(optionValue)}
                                style={{
                                    padding: '12px 16px',
                                    color: isDisabled ? '#64748b' : '#f1f5f9',
                                    backgroundColor: isSelected ? 'rgba(96, 165, 250, 0.15)' : 'transparent',
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    transition: 'background-color 0.15s ease',
                                    borderBottom: index < options.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                    fontSize: '1rem',
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isDisabled && !isSelected) {
                                        e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isDisabled) {
                                        e.target.style.backgroundColor = isSelected ? 'rgba(96, 165, 250, 0.15)' : 'transparent';
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
