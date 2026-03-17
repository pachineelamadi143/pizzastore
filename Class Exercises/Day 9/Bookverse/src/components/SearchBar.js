import React from 'react';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
  }

  focusInput = () => {
    // Uncontrolled focusing using refs
    if (this.inputRef.current) this.inputRef.current.focus();
  };

  render() {
    return (
      <div className="d-flex w-100">
        <input ref={this.inputRef} type="search" placeholder="Search books..." className="form-control me-2" />
        <button className="btn btn-outline-primary me-2" onClick={this.focusInput}>Focus</button>
        <button className="btn btn-primary">Search</button>
      </div>
    );
  }
}

export default SearchBar;
