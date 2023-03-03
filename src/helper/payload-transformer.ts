/*!
 * Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

import { SearchPayload } from '../static';

export interface PayloadTransformRule {
  // keys list in order to access to edit the desired attribute in deeper levels
  targetRoute: string[];
  method: 'add' | 'remove' | 'set';
  value?: any;
  values?: any[];
}

export const transformPayloadData = (rules: PayloadTransformRule[], payloadData: SearchPayload): SearchPayload => {
  const processedRules: PayloadTransformRule[] = [];
  rules.forEach(rule => {
    if (rule.values !== undefined) {
      processedRules.push(...rule.values.map(value => ({ targetRoute: rule.targetRoute, method: rule.method, value })));
    } else {
      processedRules.push(rule);
    }
  });
  processedRules.forEach(rule => {
    let targetNode: any = payloadData;
    rule.targetRoute.forEach(targetRouteKey => (targetNode = targetNode[targetRouteKey]));

    switch (rule.method) {
      case 'add':
        if (typeof targetNode.splice !== 'undefined') {
          targetNode.push(rule.value);
        }
        break;
      case 'remove':
        if (typeof targetNode.splice !== 'undefined' && (targetNode as any[]).includes(rule.value)) {
          (targetNode as any[]).splice((targetNode as any[]).indexOf(rule.value), 1);
        }
        break;
      case 'set':
        targetNode = rule.value;
    }
  });
  return payloadData;
};

export const validateRulesOnPayloadData = (rules: PayloadTransformRule[], payloadData: SearchPayload): boolean => {
  let validatedRules = 0;
  const processedRules: PayloadTransformRule[] = [];
  rules.forEach(rule => {
    if (rule.values !== undefined) {
      processedRules.push(...rule.values.map(value => ({ targetRoute: rule.targetRoute, method: rule.method, value })));
    } else {
      processedRules.push(rule);
    }
  });
  processedRules.forEach(rule => {
    let targetNode: any = payloadData;
    rule.targetRoute.forEach(targetRouteKey => (targetNode = targetNode[targetRouteKey]));

    switch (rule.method) {
      case 'add':
        if (typeof targetNode.splice !== 'undefined' && targetNode.find((elm: any) => elm === rule.value) !== undefined) {
          validatedRules++;
        } else {
          return false;
        }
        break;
      case 'remove':
        if (typeof targetNode.splice !== 'undefined' && targetNode.find((elm: any) => elm === rule.value) === undefined) {
          validatedRules++;
        } else {
          return false;
        }
        break;
      case 'set':
        if (targetNode === rule.value) {
          validatedRules++;
        } else {
          return false;
        }
    }
  });
  return validatedRules === rules.length;
};
