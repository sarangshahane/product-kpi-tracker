<?php
/**
 * Formula Engine — safely evaluates custom KPI formula expressions.
 *
 * @package ProductKPITracker
 */

namespace PKT;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Formula_Engine — evaluates mathematical expressions without eval().
 *
 * Supported operators : + - * / ( )
 * Supported operands  : numeric literals, variable names (letters, digits, underscores)
 * NOT supported       : PHP functions, strings, arrays, bitwise ops, comparisons
 *
 * Usage:
 *   $engine = new Formula_Engine( array( 'revenue' => 5000, 'cogs' => 2000, 'orders' => 100 ) );
 *   $result = $engine->evaluate( '(revenue - cogs) / revenue * 100' );
 */
class Formula_Engine {

	/**
	 * Named variables available for substitution.
	 *
	 * @var array<string,float>
	 */
	private $variables = array();

	/**
	 * Tokenized expression.
	 *
	 * @var array<array{type:string,value:string|float}>
	 */
	private $tokens = array();

	/**
	 * Current position in the token stream.
	 *
	 * @var int
	 */
	private $position = 0;

	/**
	 * Constructor.
	 *
	 * @param array<string,float|int> $variables Named variables.
	 */
	public function __construct( array $variables = array() ) {
		foreach ( $variables as $name => $value ) {
			$this->variables[ $name ] = (float) $value;
		}
	}

	/**
	 * Register or overwrite a variable.
	 *
	 * @param string    $name  Variable name (letters, digits, underscores).
	 * @param float|int $value Numeric value.
	 * @return void
	 */
	public function set_variable( $name, $value ) {
		$this->variables[ $name ] = (float) $value;
	}

	/**
	 * Evaluate a mathematical expression string.
	 *
	 * @param string $expression Expression to evaluate.
	 * @return float|WP_Error Result or WP_Error on failure.
	 */
	public function evaluate( $expression ) {
		$this->tokens   = $this->tokenize( $expression );
		$this->position = 0;

		if ( empty( $this->tokens ) ) {
			return 0.0;
		}

		$result = $this->parse_expression();

		if ( $this->position < count( $this->tokens ) ) {
			return new \WP_Error(
				'pkt_formula_syntax',
				sprintf(
					/* translators: %s: unexpected token */
					__( 'Unexpected token: %s', 'product-kpi-tracker' ),
					$this->tokens[ $this->position ]['value']
				)
			);
		}

		return $result;
	}

	/**
	 * Tokenize the expression into a flat token array.
	 *
	 * Token types: NUMBER, VARIABLE, PLUS, MINUS, MULTIPLY, DIVIDE, LPAREN, RPAREN
	 *
	 * @param string $expression Raw expression string.
	 * @return array<array{type:string,value:string|float}>
	 * @throws \InvalidArgumentException On unrecognised characters.
	 */
	private function tokenize( $expression ) {
		$tokens = array();
		$length = strlen( $expression );
		$i      = 0;

		while ( $i < $length ) {
			$char = $expression[ $i ];

			// Skip whitespace.
			if ( ' ' === $char || "\t" === $char ) {
				++$i;
				continue;
			}

			// Numeric literal (integer or decimal).
			if ( ctype_digit( $char ) || ( '.' === $char && $i + 1 < $length && ctype_digit( $expression[ $i + 1 ] ) ) ) {
				$num = '';
				while ( $i < $length && ( ctype_digit( $expression[ $i ] ) || '.' === $expression[ $i ] ) ) {
					$num .= $expression[ $i ];
					++$i;
				}
				$tokens[] = array( 'type' => 'NUMBER', 'value' => (float) $num );
				continue;
			}

			// Variable name (letters, digits, underscores — must start with letter or underscore).
			if ( ctype_alpha( $char ) || '_' === $char ) {
				$name = '';
				while ( $i < $length && ( ctype_alnum( $expression[ $i ] ) || '_' === $expression[ $i ] ) ) {
					$name .= $expression[ $i ];
					++$i;
				}
				$tokens[] = array( 'type' => 'VARIABLE', 'value' => $name );
				continue;
			}

			// Operators and parentheses.
			$type_map = array(
				'+' => 'PLUS',
				'-' => 'MINUS',
				'*' => 'MULTIPLY',
				'/' => 'DIVIDE',
				'(' => 'LPAREN',
				')' => 'RPAREN',
			);

			if ( isset( $type_map[ $char ] ) ) {
				$tokens[] = array( 'type' => $type_map[ $char ], 'value' => $char );
				++$i;
				continue;
			}

			// Unrecognised character — reject to prevent injection.
			return array();
		}

		return $tokens;
	}

	/**
	 * Parse addition and subtraction (lowest precedence).
	 *
	 * @return float
	 */
	private function parse_expression() {
		$left = $this->parse_term();

		while ( $this->position < count( $this->tokens ) &&
			in_array( $this->tokens[ $this->position ]['type'], array( 'PLUS', 'MINUS' ), true )
		) {
			$op = $this->tokens[ $this->position ]['type'];
			++$this->position;
			$right = $this->parse_term();

			$left = 'PLUS' === $op ? $left + $right : $left - $right;
		}

		return $left;
	}

	/**
	 * Parse multiplication and division (higher precedence).
	 *
	 * @return float
	 */
	private function parse_term() {
		$left = $this->parse_factor();

		while ( $this->position < count( $this->tokens ) &&
			in_array( $this->tokens[ $this->position ]['type'], array( 'MULTIPLY', 'DIVIDE' ), true )
		) {
			$op = $this->tokens[ $this->position ]['type'];
			++$this->position;
			$right = $this->parse_factor();

			if ( 'DIVIDE' === $op ) {
				$left = ( 0.0 !== $right ) ? $left / $right : 0.0;
			} else {
				$left = $left * $right;
			}
		}

		return $left;
	}

	/**
	 * Parse a factor: number, variable, unary minus, or parenthesised expression.
	 *
	 * @return float
	 */
	private function parse_factor() {
		if ( $this->position >= count( $this->tokens ) ) {
			return 0.0;
		}

		$token = $this->tokens[ $this->position ];

		// Unary minus.
		if ( 'MINUS' === $token['type'] ) {
			++$this->position;
			return -1 * $this->parse_factor();
		}

		// Parenthesised sub-expression.
		if ( 'LPAREN' === $token['type'] ) {
			++$this->position;
			$value = $this->parse_expression();

			// Consume closing paren if present.
			if ( $this->position < count( $this->tokens ) && 'RPAREN' === $this->tokens[ $this->position ]['type'] ) {
				++$this->position;
			}

			return $value;
		}

		// Numeric literal.
		if ( 'NUMBER' === $token['type'] ) {
			++$this->position;
			return (float) $token['value'];
		}

		// Variable name.
		if ( 'VARIABLE' === $token['type'] ) {
			++$this->position;
			$name = $token['value'];
			return isset( $this->variables[ $name ] ) ? $this->variables[ $name ] : 0.0;
		}

		return 0.0;
	}

	/**
	 * Evaluate all active custom formulas against a KPI stats array.
	 *
	 * Reads formulas from get_option('pkt_formulas') and evaluates each active one
	 * using the provided stats as variable context. Results are keyed by formula name.
	 *
	 * @param array $stats Current KPI stats array.
	 * @return array<string,float> Evaluated custom KPI values.
	 */
	public static function evaluate_custom_kpis( array $stats ) {
		$formulas = get_option( 'pkt_formulas', array() );

		if ( empty( $formulas ) ) {
			return array();
		}

		$results = array();

		foreach ( $formulas as $formula ) {
			if ( empty( $formula['isActive'] ) || empty( $formula['name'] ) || empty( $formula['formula'] ) ) {
				continue;
			}

			// Build variable context from stats + any named variables in the formula definition.
			$context = array();

			// Map standard stats as variables.
			foreach ( $stats as $key => $value ) {
				if ( is_numeric( $value ) ) {
					$context[ $key ] = (float) $value;
				}
			}

			// Override with formula-specific variable bindings.
			if ( ! empty( $formula['variables'] ) && is_array( $formula['variables'] ) ) {
				foreach ( $formula['variables'] as $var ) {
					$var_name   = $var['name'] ?? '';
					$var_source = $var['source'] ?? '';

					if ( $var_name && isset( $stats[ $var_source ] ) ) {
						$context[ $var_name ] = (float) $stats[ $var_source ];
					}
				}
			}

			$engine = new self( $context );
			$value  = $engine->evaluate( $formula['formula'] );

			if ( ! is_wp_error( $value ) ) {
				// Sanitize key: letters/digits/dashes only.
				$key             = sanitize_title( $formula['name'] );
				$results[ $key ] = round( $value, 4 );
			}
		}

		return $results;
	}
}
