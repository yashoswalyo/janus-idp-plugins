/**
 * Configuration options for the application.
 */
export interface Config {
  /**
   * @visibility frontend
   */
  feedback?: {
    /**
     * @visibility frontend
     */
    summaryLimit?: number;
    /**
     * @visibility frontend
     */
    baseEntityRef: string;
  };
}
