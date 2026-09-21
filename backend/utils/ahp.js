/**
 * Saaty's Random Consistency Index (RI) table, indexed by matrix order n.
 * Standard values as published by Saaty (1980) and widely used in AHP literature.
 */
const RI_TABLE = {
  1: 0,
  2: 0,
  3: 0.58,
  4: 0.9,
  5: 1.12,
  6: 1.24,
  7: 1.32,
  8: 1.41,
  9: 1.45,
  10: 1.49,
};

/**
 * Computes AHP priority weights and the Consistency Ratio (CR) for an n x n
 * pairwise comparison matrix, following the standard four-step AHP procedure:
 *   1. Sum each column of the matrix
 *   2. Normalize the matrix and average each row to obtain priority weights
 *   3. Compute lambda_max, the Consistency Index (CI), and the Consistency Ratio (CR)
 *   4. Return the weights together with the consistency results
 */
function computeAHPWeights(matrix, n) {
  // Step 1: sum each column
  const colSums = new Array(n).fill(0);
  for (let j = 0; j < n; j++) {
    for (let i = 0; i < n; i++) {
      colSums[j] += matrix[i][j];
    }
  }

  // Step 2: normalize the matrix and compute row averages (the priority weights)
  const weights = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    let rowSum = 0;
    for (let j = 0; j < n; j++) {
      rowSum += matrix[i][j] / colSums[j];
    }
    weights[i] = rowSum / n;
  }

  // Step 3: compute lambda_max
  // For each row, multiply the matrix row by the weights vector, then divide
  // by that row's own weight; lambda_max is the average of these values.
  let lambdaSum = 0;
  for (let i = 0; i < n; i++) {
    let weightedRowSum = 0;
    for (let j = 0; j < n; j++) {
      weightedRowSum += matrix[i][j] * weights[j];
    }
    lambdaSum += weightedRowSum / weights[i];
  }
  const lambdaMax = lambdaSum / n;

  const CI = (lambdaMax - n) / (n - 1 || 1);
  const RI = RI_TABLE[n] ?? 1.49;
  const CR = RI === 0 ? 0 : CI / RI;

  return {
    weights,
    lambdaMax,
    CI,
    RI,
    CR,
    consistent: CR <= 0.1,
  };
}

module.exports = { computeAHPWeights, RI_TABLE };
