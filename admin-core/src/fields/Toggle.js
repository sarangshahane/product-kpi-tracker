import React from 'react';

const Toggle = ( {
	checked,
	onChange,
	disabled = false,
} ) => {
	return (
		<label className="pkt-inline-flex pkt-relative pkt-items-center pkt-cursor-pointer">
			<input
				type="checkbox"
				className="pkt-sr-only peer"
				checked={ checked }
				onChange={ onChange }
				disabled={ disabled }
			/>
			<div className={ `
        pkt-w-11 pkt-h-6 pkt-bg-gray-200 pkt-rounded-full peer
        peer-focus:pkt-ring-4 peer-focus:pkt-ring-blue-300
        peer-checked:after:pkt-translate-x-full peer-checked:after:pkt-border-white
        after:pkt-content-[''] after:pkt-absolute after:pkt-top-0.5 after:pkt-left-[2px]
        after:pkt-bg-white after:pkt-border-gray-300 after:pkt-border after:pkt-rounded-full
        after:pkt-h-5 after:pkt-w-5 after:pkt-transition-all
        peer-checked:pkt-bg-blue-600
        ${ disabled ? 'pkt-opacity-50 pkt-cursor-not-allowed' : '' }
      ` }></div>
		</label>
	);
};

export default Toggle;
