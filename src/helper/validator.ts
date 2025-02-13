/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { ValidationPattern } from '../static';

export const isTextualFormItemValid = (value: string, validationPatterns: {
  operator?: 'and' | 'or';
  genericValidationErrorMessage?: string;
  patterns: ValidationPattern[];
}): {
  isValid: boolean;
  validationErrors: string[];
} => {
  let isValid = true;
  let validationErrors: string[] = [];
  if (validationPatterns != null) {
    isValid = validationPatterns.patterns.reduce<boolean>((prevValidation, currentPattern): boolean => {
      const isCurrentPatternValid = (value.match(currentPattern.pattern) != null);
      if (!isCurrentPatternValid && currentPattern.errorMessage != null) {
        validationErrors.push(currentPattern.errorMessage);
      }
      if (validationPatterns.operator === 'and') {
        return prevValidation && isCurrentPatternValid;
      }
      return prevValidation || isCurrentPatternValid;
    }, validationPatterns.operator === 'and');
  }
  if (isValid) {
    validationErrors = [];
  } else if (validationErrors.length === 0 && validationPatterns.genericValidationErrorMessage != null) {
    validationErrors.push(validationPatterns.genericValidationErrorMessage);
  }
  return { isValid, validationErrors };
};

export const isMandatoryItemValid = (value: string): boolean => value !== undefined && value.trim() !== '';
