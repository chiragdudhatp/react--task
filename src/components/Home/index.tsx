import React, { useState, useRef, useEffect } from 'react';
import './index.css';

const Disperse: React.FC = () => {
    const [inputFields, setInputFields] = useState(['']);
    const [errors, setErrors] = useState<string[]>([]);
    const [showExampleData, setShowExampleData] = useState<string[]>([
        '0x2CB99F193549681e06C6770dDD5543812B4FaFE8=1',
        '0x8B3392483BA26D65E331dB86D4F430E9B3814E5e 50',
        '0xEb0D38c92deB969b689acA94D962A07515CC5204=2',
        '0xF4aDE8368DDd835B70b625CF7E3E1Bc5791D18C1=10',
        '0x09ae5A64465c18718a46b3aD946270BD3E5e6aaB,13'
    ]);
    const [hasDuplicates, setHasDuplicates] = useState(false);
    const [isShow, setIsShow] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const lastInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (lastInputRef.current) {
            lastInputRef.current.focus();
        }
    }, [inputFields.length]); // Set focus on the last input when inputFields change

    const handleInputChange = (index: number, value: string) => {
        const newInputFields = [...inputFields];
        newInputFields[index] = value;
        setInputFields(newInputFields);
    };

    const handleEnterPress = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();

            const nextIndex = index + 1;
            if (nextIndex < inputFields.length) {
                const nextInputRef = inputRefs.current[nextIndex];
                if (nextInputRef) {
                    nextInputRef.focus();
                }
            } else {
                setInputFields([...inputFields, '']);
            }
        }
    };
    const handleBackspace = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Backspace' && inputFields[index] === '') {
            if (index > 0) {
                event.preventDefault();
                const newInputFields = [...inputFields];
                newInputFields.splice(index, 1);
                setInputFields(newInputFields);
                const prevInputRef = inputRefs.current[index - 1];
                if (prevInputRef) {
                    prevInputRef.focus();
                }
            }
        }
    };

    const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        event.preventDefault();
        const clipboardData = event.clipboardData?.getData('text');

        if (clipboardData) {
            const clipboardLines = clipboardData.split('\n');
            const newInputFields = [...inputFields];

            // Insert the clipboard data starting from the current input field
            for (const line of clipboardLines) {
                if (line.trim()) {
                    newInputFields.splice(index, 0, line.trim());
                    index++;
                }
            }

            setInputFields(newInputFields);
        }
    };

    const validateInput = () => {
        const addresses = new Map<string, number[]>();
        const newErrors: string[] = [];

        inputFields.forEach((input, index) => {
            const parts = input.split(/=|,| /);
            const address = parts[0];
            const amount = Number(parts[1]);

            if (address.length !== 42) {
                newErrors.push(`Line ${index + 1} invalid Ethereum address and wrong amount`);
            }

            if (!address.startsWith('0x')) {
                newErrors.push(`Line ${index + 1} invalid Ethereum address`);
            }

            if (isNaN(amount) || amount <= 0) {
                newErrors.push(`Line ${index + 1} wrong amount.`);
            }

            if (addresses.has(address)) {
                addresses.get(address)?.push(index + 1);
            } else {
                addresses.set(address, [index + 1]);
            }
        });

        const duplicateErrors = Array.from(addresses.entries())
            .filter(([_, lineNumbers]) => lineNumbers.length > 1)
            .map(([address, lineNumbers]) => `${address} Duplicates in Line: ${lineNumbers.join(', ')}`);

        setErrors([...newErrors, ...duplicateErrors]);

        // Set hasDuplicates to true if duplicateErrors is not empty
        setHasDuplicates(duplicateErrors.length > 0);

        if (newErrors.length === 0) {
            console.log('No validation errors.');
        }
        setIsShow(false);
    };
    const handleDuplicateAddress = () => {
        const seenAddresses = new Set<string>();
        const filteredInputFields = inputFields.filter((value) => {
            const parts = value.split(/=|,| /);
            const address = parts[0];
            if (!seenAddresses.has(address)) {
                seenAddresses.add(address);
                return true;
            }
            return false;
        });

        setInputFields(filteredInputFields);
        setErrors([]);
        setHasDuplicates(false)
    };

    const handleShowExample = () => {
        setIsShow(!isShow);
    }

    return (
        <div className='h-auto min-h-screen w-full bg-gray-400 p-5 p-2 rounded'>
            <div className="flex h-auto min-h-50 bg-black rounded-md text-white ">
                <div className='flex flex-col items-end w-1/12 border-r-2 border-gray-400 pr-4 text-gray-600 font-bold'>
                    {inputFields.map((_, index) => (
                        <div key={index}>
                            {index + 1}
                        </div>
                    ))}
                </div>
                <div className='w-11/12 font-medium'>
                    {inputFields.map((value, index) => (
                        <div key={index}>
                            <input
                                className='bg-transparent border-none w-full'
                                ref={(ref) => {
                                    inputRefs.current[index] = ref;
                                    if (index === inputFields.length - 1) {
                                        lastInputRef.current = ref;
                                    }
                                }}
                                value={value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => {
                                    handleEnterPress(index, e);
                                    handleBackspace(index, e);
                                }}
                                onPaste={(e) => handlePaste(e, index)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-between text-white mt-5">
                <div className='font-medium'>
                    Separated by ',' or '='
                </div>
                <div className='opacity-60 cursor-pointer' onClick={handleShowExample}>
                    Show Example
                </div>
            </div>
            {hasDuplicates && (
                <div className="flex justify-between text-white mt-5"> {/* Conditionally render this component */}
                    <div>
                        Duplicates
                    </div>
                    <div className=' flex gap-1 text-red-500'>
                        <div onClick={handleDuplicateAddress} className='cursor-pointer'>Keep the first one</div>
                        {' | '}
                        <div onClick={handleDuplicateAddress} className='cursor-pointer'>Combine Balance</div>
                    </div>
                </div>
            )}
            {isShow && (
                <div className="flex gap-2.5 p-5 border  border-solid rounded-lg text-white font-medium mt-5">
                    <div >
                        {showExampleData.map((data, index) => (
                            <div key={index}>
                                {data}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {errors.length > 0 && (
                <div className="flex gap-2.5 p-5 border border-red-500 border-solid rounded-lg text-red-500 font-medium mt-5">
                    <div >
                        <i className="material-icons material-symbols-outlined">error</i>
                    </div>
                    <div >
                        {errors.map((error, index) => (
                            <div key={index}>
                                {error}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <button className='w-full  opacity-60 rounded-xl mt-5 h-12 text-white bg-gradient-to-r from-sky-500 to-indigo-500' onClick={validateInput}>Next</button>
        </div>
    );
};

export default Disperse;
