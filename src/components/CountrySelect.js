import React from 'react';
import Select from 'react-select';
import { getData } from 'country-list';

const CountrySelect = ({ value, onChange }) => {
  const countries = getData().map(country => ({
    label: country.name,
    value: country.code
  }));

  const selectedOption = countries.find(option => option.label === value);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      border: state.isFocused ? '1px solid #1890ff' : '1px solid #d9d9d9',
      borderRadius: '4px',
      boxShadow: 'none',
      width: 200,
      '&:hover': {
        border: state.isFocused ? '1px solid #40a9ff' : '1px solid #d9d9d9',
      },
    }),
    menu: (provided) => ({
      ...provided,
      width: 200,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#f5f5f5' : 'white',
      '&:hover': {
        backgroundColor: '#f5f5f5',
      },
    }),
  };

  return (
    <Select
      options={countries}
      value={selectedOption} // Set the selected value based on prop
      onChange={onChange} // Propagate changes up
      placeholder="Search countries..."
      isClearable={true}
      isSearchable={true}
    />
  );
};

export default CountrySelect;
