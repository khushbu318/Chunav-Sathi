import { useState, useEffect, useCallback } from 'react';
import type {
  PincodeLocation,
  ConstituencyData,
  MPDetails
} from '../lib/constituencyLookup';
import {
  lookupConstituency,
  resolvePostalcode,
  fetchMPDataCached,
  fullConstituencyLookup
} from '../lib/constituencyLookup';

export interface UseConstituencyLookupReturn {
  // State
  step: 'input' | 'confirm' | 'result';
  pincode: string;
  location: PincodeLocation | null;
  constituency: ConstituencyData | null;
  error: string | null;

  // Flags
  isResolvingPostal: boolean;
  isLoadingMP: boolean;
  isLoading: boolean;

  // Methods
  handlePincodeSubmit: (pincode: string) => Promise<void>;
  handleConfirm: () => Promise<void>;
  handleEdit: () => void;
  resetFlow: () => void;
}

/**
 * Custom hook for managing the full constituency lookup flow
 * Handles:
 * 1. Pincode input validation
 * 2. Location resolution (postalpincode.in API)
 * 3. Constituency lookup (local JSON)
 * 4. MP data fetching (Wikidata, cached)
 */
export function useConstituencyLookup(): UseConstituencyLookupReturn {
  // State
  const [step, setStep] = useState<'input' | 'confirm' | 'result'>('input');
  const [pincode, setPincode] = useState('');
  const [location, setLocation] = useState<PincodeLocation | null>(null);
  const [constituency, setConstituency] = useState<ConstituencyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading flags
  const [isResolvingPostal, setIsResolvingPostal] = useState(false);
  const [isLoadingMP, setIsLoadingMP] = useState(false);

  // Cached pincode map and all constituencies
  const [pincodeMap, setPincodeMap] = useState<Record<string, any> | null>(null);
  const [allConstituencies, setAllConstituencies] = useState<Record<string, any>[] | null>(null);

  // Load pincode map and all constituencies on mount
  useEffect(() => {
    const loadDataFiles = async () => {
      try {
        const [pincodeResponse, constituenciesResponse] = await Promise.all([
          fetch('/data/pincode_constituency_map.json'),
          fetch('/data/all_constituencies.json')
        ]);

        const pincodeData = await pincodeResponse.json();
        const constituenciesData = await constituenciesResponse.json();

        setPincodeMap(pincodeData);
        setAllConstituencies(constituenciesData);
      } catch (err) {
        console.error('Failed to load data files:', err);
        setError('Failed to load data. Please refresh the page.');
      }
    };

    loadDataFiles();
  }, []);

  /**
   * Step 1: User submits pincode
   * Try direct lookup first (instant), then validate with postalpincode if needed
   */
  const handlePincodeSubmit = useCallback(async (inputPincode: string) => {
    setError(null);

    try {
      setIsResolvingPostal(true);
      setPincode(inputPincode);

      // First, try direct constituency lookup
      if (pincodeMap && allConstituencies) {
        const directResult = await fullConstituencyLookup(
          inputPincode,
          pincodeMap,
          allConstituencies
        );

        if (directResult) {
          // Found! Skip confirmation and show result directly
          setIsLoadingMP(true);
          try {
            const resultData: ConstituencyData = {
              name: directResult.name,
              state: directResult.state,
              mpName: directResult.mpName,
              mpParty: directResult.mpParty,
              mpPhotoUrl: directResult.mpPhotoUrl,
              turnout: Math.round(Math.random() * 40 + 45),
              margin: Math.round(Math.random() * 500000 + 10000),
              voteShare: Math.round(Math.random() * 30 + 25)
            };

            setLocation({
              state: directResult.state,
              district: 'Auto-detected',
              taluk: undefined
            });
            setConstituency(resultData);
            setStep('result');
            return;
          } finally {
            setIsLoadingMP(false);
          }
        }
      }

      // Fallback: Validate with postalpincode API and ask for confirmation
      const resolvedLocation = await resolvePostalcode(inputPincode);
      setLocation(resolvedLocation);
      setStep('confirm');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to resolve pincode';
      setError(errMsg);
      setStep('input');
    } finally {
      setIsResolvingPostal(false);
    }
  }, [pincodeMap, allConstituencies]);

  /**
   * Step 2: User confirms location
   * Uses enhanced lookup with fallback: local map → postalpincode API → find by state
   */
  const handleConfirm = useCallback(async () => {
    if (!location || !pincodeMap) return;

    setError(null);

    try {
      setIsLoadingMP(true);

      // Use enhanced lookup with fallback mechanisms
      const result = await fullConstituencyLookup(
        pincode,
        pincodeMap,
        allConstituencies || undefined
      );

      if (!result) {
        setError('Constituency not found for this pincode. Please check the pincode and try again.');
        setStep('input');
        return;
      }

      // Build result with any cached data
      const resultData: ConstituencyData = {
        name: result.name,
        state: result.state,
        mpName: result.mpName,
        mpParty: result.mpParty,
        mpPhotoUrl: result.mpPhotoUrl,
        // Add placeholder values for optional fields
        turnout: Math.round(Math.random() * 40 + 45), // Placeholder: 45-85%
        margin: Math.round(Math.random() * 500000 + 10000), // Placeholder
        voteShare: Math.round(Math.random() * 30 + 25) // Placeholder: 25-55%
      };

      setConstituency(resultData);
      setStep('result');
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Failed to fetch constituency data';
      console.error('handleConfirm error:', errMsg);
      setError(errMsg);
      setStep('input');
    } finally {
      setIsLoadingMP(false);
    }
  }, [location, pincodeMap, pincode, allConstituencies]);

  /**
   * Go back to input step
   */
  const handleEdit = useCallback(() => {
    setStep('input');
    setError(null);
  }, []);

  /**
   * Reset entire flow
   */
  const resetFlow = useCallback(() => {
    setStep('input');
    setPincode('');
    setLocation(null);
    setConstituency(null);
    setError(null);
    setIsResolvingPostal(false);
    setIsLoadingMP(false);
  }, []);

  return {
    // State
    step,
    pincode,
    location,
    constituency,
    error,

    // Flags
    isResolvingPostal,
    isLoadingMP,
    isLoading: isResolvingPostal || isLoadingMP,

    // Methods
    handlePincodeSubmit,
    handleConfirm,
    handleEdit,
    resetFlow
  };
}
