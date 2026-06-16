/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Tribute {
  id: string;
  name: string;
  relation: string;
  message: string;
  litCandle: boolean;
  createdAt: string;
}

export interface Photo {
  id: string;
  url: string;
  caption?: string;
  uploadedBy?: string;
  createdAt: string;
}

export interface Milestone {
  id: string;
  year: string;
  title: string;
  description: string;
  isCustom?: boolean;
}

export interface AIAnalysisResult {
  themes: { word: string; count: number }[];
  summary: string;
}
