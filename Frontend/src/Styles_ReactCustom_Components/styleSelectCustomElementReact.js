//src\Styles_ReactCustom_Components\styleSelectCustomElementReact.js

const customSelectStyles = {
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'white',
    border: '2px solid #03c1c4',
    borderRadius: '15px',
    color: '#303841',
    fontSize: '16px',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px',
    marginTop: '5px',
    '&:hover': {
      borderColor: '#03c1c4'
    },
    width:'100%',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#999',
    textAlign: 'center'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#303841',
    textAlign: 'center'
  }),
  input: (provided) => ({
    ...provided,
    color: '#303841',
    textAlign: 'center'
  }),
  menu: (provided) => ({
    ...provided,
    boxShadow: 'rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px',
    
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#03c1c4'
      : state.isFocused
      ? '#e0f7f7'
      : 'white',
    color: state.isSelected ? 'white' : '#303841',
    fontWeight: '600',
    cursor: 'pointer'
  }),menuList: (provided) => ({
    ...provided,
    '::-webkit-scrollbar': {
      display: 'none', // Chrome, Safari
    },
    maxHeight:'150px',
    borderRadius: '15px'
  })
};

export default customSelectStyles;
