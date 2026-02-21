import React, { useState, useEffect } from 'react';
import { Card, Button, Title, Input, Toggle } from '../fields';
import apiFetch from '@wordpress/api-fetch';

/**
 * Formulas page — CRUD for custom KPI formulas.
 * Persists to wp_options via pkt/v1/formulas (AD-4).
 */
const Formulas = () => {
	const [ formulas, setFormulas ] = useState( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const [ isEditing, setIsEditing ] = useState( false );
	const [ isSaving, setIsSaving ] = useState( false );
	const [ currentFormula, setCurrentFormula ] = useState( null );
	const [ error, setError ] = useState( '' );

	useEffect( () => {
		apiFetch( { path: '/pkt/v1/formulas' } )
			.then( ( data ) => {
				setFormulas( data );
				setIsLoading( false );
			} )
			.catch( ( err ) => {
				console.error( 'Error fetching formulas:', err );
				setIsLoading( false );
			} );
	}, [] );

	const handleAddFormula = () => {
		setCurrentFormula( {
			id: null,
			name: '',
			formula: '',
			description: '',
			isActive: true,
			variables: [ { name: '', source: '' } ],
		} );
		setError( '' );
		setIsEditing( true );
	};

	const handleEditFormula = ( formula ) => {
		setCurrentFormula( { ...formula } );
		setError( '' );
		setIsEditing( true );
	};

	const handleDeleteFormula = ( id ) => {
		if ( ! window.confirm( 'Are you sure you want to delete this formula?' ) ) {
			return;
		}

		apiFetch( { path: `/pkt/v1/formulas/${ id }`, method: 'DELETE' } )
			.then( () => {
				setFormulas( formulas.filter( ( f ) => f.id !== id ) );
			} )
			.catch( ( err ) => {
				console.error( 'Error deleting formula:', err );
			} );
	};

	const handleToggleActive = ( id ) => {
		const formula = formulas.find( ( f ) => f.id === id );
		if ( ! formula ) {
			return;
		}

		const updated = { ...formula, isActive: ! formula.isActive };

		apiFetch( { path: `/pkt/v1/formulas/${ id }`, method: 'PUT', data: updated } )
			.then( ( saved ) => {
				setFormulas( formulas.map( ( f ) => ( f.id === id ? saved : f ) ) );
			} )
			.catch( ( err ) => {
				console.error( 'Error toggling formula:', err );
			} );
	};

	const handleSaveFormula = () => {
		if ( ! currentFormula.name || ! currentFormula.formula ) {
			setError( 'Formula name and expression are required.' );
			return;
		}

		setIsSaving( true );
		setError( '' );

		const isNew = ! currentFormula.id;
		const path = isNew ? '/pkt/v1/formulas' : `/pkt/v1/formulas/${ currentFormula.id }`;
		const method = isNew ? 'POST' : 'PUT';

		apiFetch( { path, method, data: currentFormula } )
			.then( ( saved ) => {
				if ( isNew ) {
					setFormulas( [ ...formulas, saved ] );
				} else {
					setFormulas( formulas.map( ( f ) => ( f.id === saved.id ? saved : f ) ) );
				}
				setIsSaving( false );
				setIsEditing( false );
				setCurrentFormula( null );
			} )
			.catch( ( err ) => {
				console.error( 'Error saving formula:', err );
				setError( 'Failed to save formula. Please try again.' );
				setIsSaving( false );
			} );
	};

	const handleCancelEdit = () => {
		setIsEditing( false );
		setCurrentFormula( null );
		setError( '' );
	};

	const handleFormulaChange = ( field, value ) => {
		setCurrentFormula( { ...currentFormula, [ field ]: value } );
	};

	const handleVariableChange = ( index, field, value ) => {
		const updatedVariables = [ ...currentFormula.variables ];
		updatedVariables[ index ] = { ...updatedVariables[ index ], [ field ]: value };
		setCurrentFormula( { ...currentFormula, variables: updatedVariables } );
	};

	const addVariable = () => {
		setCurrentFormula( {
			...currentFormula,
			variables: [ ...currentFormula.variables, { name: '', source: '' } ],
		} );
	};

	const removeVariable = ( index ) => {
		const updatedVariables = [ ...currentFormula.variables ];
		updatedVariables.splice( index, 1 );
		setCurrentFormula( { ...currentFormula, variables: updatedVariables } );
	};

	if ( isLoading ) {
		return (
			<div className="pkt-flex pkt-justify-center pkt-items-center pkt-h-64">
				<div className="pkt-text-lg pkt-text-gray-600">Loading formulas...</div>
			</div>
		);
	}

	if ( isEditing ) {
		return (
			<div className="pkt-admin-container">
				<Title text={ currentFormula.id ? 'Edit Formula' : 'Add New Formula' } />

				{ error && (
					<div className="pkt-bg-red-50 pkt-border pkt-border-red-200 pkt-rounded-md pkt-p-3 pkt-mb-4">
						<p className="pkt-text-sm pkt-text-red-700">{ error }</p>
					</div>
				) }

				<Card className="pkt-mb-6">
					<div className="pkt-grid pkt-grid-cols-1 pkt-gap-4">
						<div>
							<label className="pkt-label">Formula Name</label>
							<Input
								value={ currentFormula.name }
								onChange={ ( e ) => handleFormulaChange( 'name', e.target.value ) }
								placeholder="e.g., Gross Profit Margin"
							/>
						</div>

						<div>
							<label className="pkt-label">Formula Expression</label>
							<Input
								value={ currentFormula.formula }
								onChange={ ( e ) => handleFormulaChange( 'formula', e.target.value ) }
								placeholder="e.g., (Revenue - COGS) / Revenue * 100"
							/>
						</div>

						<div>
							<label className="pkt-label">Description</label>
							<Input
								value={ currentFormula.description }
								onChange={ ( e ) => handleFormulaChange( 'description', e.target.value ) }
								placeholder="Describe what this formula calculates"
							/>
						</div>

						<div className="pkt-flex pkt-items-center">
							<Toggle
								checked={ currentFormula.isActive }
								onChange={ ( e ) => handleFormulaChange( 'isActive', e.target.checked ) }
							/>
							<span className="pkt-ml-2 pkt-text-sm">Active</span>
						</div>
					</div>
				</Card>

				<Title text="Variables" level="h3" />

				<Card className="pkt-mb-6">
					{ currentFormula.variables.map( ( variable, index ) => (
						<div
							key={ index }
							className="pkt-grid pkt-grid-cols-1 md:pkt-grid-cols-3 pkt-gap-4 pkt-mb-4 pkt-pb-4 pkt-border-b pkt-border-gray-200 last:pkt-border-0"
						>
							<div>
								<label className="pkt-label">Variable Name</label>
								<Input
									value={ variable.name }
									onChange={ ( e ) => handleVariableChange( index, 'name', e.target.value ) }
									placeholder="e.g., Revenue"
								/>
							</div>

							<div>
								<label className="pkt-label">Data Source</label>
								<Input
									value={ variable.source }
									onChange={ ( e ) => handleVariableChange( index, 'source', e.target.value ) }
									placeholder="e.g., wc_order_stats.net_total"
								/>
							</div>

							<div className="pkt-flex pkt-items-end">
								<Button
									text="Remove"
									variant="secondary"
									onClick={ () => removeVariable( index ) }
									disabled={ currentFormula.variables.length <= 1 }
								/>
							</div>
						</div>
					) ) }

					<div className="pkt-mt-4">
						<Button text="Add Variable" variant="secondary" onClick={ addVariable } />
					</div>
				</Card>

				<div className="pkt-flex pkt-justify-end pkt-gap-2">
					<Button text="Cancel" variant="secondary" onClick={ handleCancelEdit } />
					<Button text={ isSaving ? 'Saving...' : 'Save Formula' } onClick={ handleSaveFormula } disabled={ isSaving } />
				</div>
			</div>
		);
	}

	return (
		<div className="pkt-admin-container">
			<div className="pkt-flex pkt-justify-between pkt-items-center pkt-mb-6">
				<Title text="KPI Formulas" />
				<Button text="Add New Formula" onClick={ handleAddFormula } />
			</div>

			{ formulas.length === 0 ? (
				<Card>
					<p className="pkt-text-center pkt-py-6">No formulas found. Click "Add New Formula" to create one.</p>
				</Card>
			) : (
				formulas.map( ( formula ) => (
					<Card key={ formula.id } className="pkt-mb-4">
						<div className="pkt-flex pkt-justify-between pkt-items-start pkt-mb-2">
							<div>
								<h3 className="pkt-text-lg pkt-font-semibold">{ formula.name }</h3>
								<div className="pkt-text-sm pkt-text-gray-500 pkt-mb-2">{ formula.description }</div>
							</div>
							<Toggle
								checked={ formula.isActive }
								onChange={ () => handleToggleActive( formula.id ) }
							/>
						</div>

						<div className="pkt-bg-gray-50 pkt-p-3 pkt-rounded pkt-mb-4 pkt-font-mono pkt-text-sm">
							{ formula.formula }
						</div>

						{ formula.variables && formula.variables.length > 0 && (
							<div className="pkt-mb-4">
								<h4 className="pkt-text-sm pkt-font-semibold pkt-mb-2">Variables:</h4>
								<ul className="pkt-text-sm">
									{ formula.variables.map( ( variable, index ) => (
										<li key={ index } className="pkt-mb-1">
											<span className="pkt-font-medium">{ variable.name }:</span> { variable.source }
										</li>
									) ) }
								</ul>
							</div>
						) }

						<div className="pkt-flex pkt-justify-end pkt-gap-2">
							<Button
								text="Edit"
								variant="secondary"
								onClick={ () => handleEditFormula( formula ) }
							/>
							<Button
								text="Delete"
								variant="secondary"
								onClick={ () => handleDeleteFormula( formula.id ) }
							/>
						</div>
					</Card>
				) )
			) }
		</div>
	);
};

export default Formulas;
