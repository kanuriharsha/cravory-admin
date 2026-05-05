/**
 * Test cases for location utility functions
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  extractCoordinatesFromMapsLink,
  isValidCoordinate,
  calculateDistance,
  formatDistance,
} from '../lib/locationUtils';

describe('Location Utils', () => {
  describe('extractCoordinatesFromMapsLink', () => {
    it('should extract coordinates from standard Google Maps URL', async () => {
      const url = 'https://www.google.com/maps/@17.385044,78.486671,15z';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(17.385044);
      expect(result?.lng).toBe(78.486671);
    });

    it('should extract coordinates from place URL with !3d!4d', async () => {
      const url = 'https://www.google.com/maps/place/Restaurant/@17.385044,78.486671,17z/data=!3d17.385044!4d78.486671';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(17.385044);
      expect(result?.lng).toBe(78.486671);
    });

    it('should extract coordinates from query URL', async () => {
      const url = 'https://www.google.com/maps?q=17.385044,78.486671';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(17.385044);
      expect(result?.lng).toBe(78.486671);
    });

    it('should return null for invalid URL', async () => {
      const url = 'https://www.example.com';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).toBeNull();
    });

    it('should return null for empty string', async () => {
      const result = await extractCoordinatesFromMapsLink('');
      expect(result).toBeNull();
    });

    it('should prioritize !3d!4d (place) over @ (viewport) coordinates', async () => {
      // URL with BOTH viewport (@17.4,78.4) and place (!3d17.5!4d78.5) coordinates
      // Should extract place coordinates (!3d!4d), NOT viewport (@)
      const url = 'https://www.google.com/maps/place/Restaurant/@17.4,78.4,15z/data=!3d17.5!4d78.5';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      // Should extract 17.5, 78.5 from !3d!4d (place location)
      // NOT 17.4, 78.4 from @ (viewport position)
      expect(result?.lat).toBe(17.5);
      expect(result?.lng).toBe(78.5);
    });

    it('should extract coordinates from !2d!3d pattern', async () => {
      // Some Google Maps URLs use !2d (lng) and !3d (lat)
      const url = 'https://www.google.com/maps/place/Restaurant/data=!2d78.486671!3d17.385044';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      expect(result?.lat).toBe(17.385044);
      expect(result?.lng).toBe(78.486671);
    });

    it('should prioritize !2d!3d (place) over @ (viewport) coordinates', async () => {
      // URL with BOTH viewport and !2d!3d place coordinates
      const url = 'https://www.google.com/maps/@17.4,78.4,15z/data=!2d78.5!3d17.5';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      // Should extract from !2d!3d (place location), NOT @ (viewport)
      expect(result?.lat).toBe(17.5);
      expect(result?.lng).toBe(78.5);
    });

    it('should extract coordinates from !1d!2d pattern (direction URLs)', async () => {
      // Direction/place URLs often use !1d (lng) and !2d (lat)
      const url = 'https://www.google.com/maps/dir//Hotel/@16.4305612,80.6215903/data=!2m2!1d77.5738886!2d12.9703317';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      // Should extract from !1d!2d (actual place location)
      expect(result?.lat).toBe(12.9703317);
      expect(result?.lng).toBe(77.5738886);
    });

    it('should prioritize !1d!2d (place) over @ (viewport) coordinates', async () => {
      // Real-world example: direction URL with BOTH viewport and place coordinates
      const url = 'https://www.google.com/maps/dir//Hotel+City+Meridian/@16.4305612,80.6215903,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bae1608a1334f0b:0x908abd477b060d43!2m2!1d77.5738886!2d12.9703317';
      const result = await extractCoordinatesFromMapsLink(url);
      
      expect(result).not.toBeNull();
      // Should extract 12.9703317, 77.5738886 from !1d!2d (place location)
      // NOT 16.4305612, 80.6215903 from @ (viewport)
      expect(result?.lat).toBe(12.9703317);
      expect(result?.lng).toBe(77.5738886);
    });
  });

  describe('isValidCoordinate', () => {
    it('should validate correct coordinates', () => {
      expect(isValidCoordinate(17.385044, 78.486671)).toBe(true);
      expect(isValidCoordinate(0, 0)).toBe(true);
      expect(isValidCoordinate(-17.385044, -78.486671)).toBe(true);
    });

    it('should reject invalid latitude', () => {
      expect(isValidCoordinate(91, 78.486671)).toBe(false);
      expect(isValidCoordinate(-91, 78.486671)).toBe(false);
    });

    it('should reject invalid longitude', () => {
      expect(isValidCoordinate(17.385044, 181)).toBe(false);
      expect(isValidCoordinate(17.385044, -181)).toBe(false);
    });

    it('should reject NaN values', () => {
      expect(isValidCoordinate(NaN, 78.486671)).toBe(false);
      expect(isValidCoordinate(17.385044, NaN)).toBe(false);
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      // HITEC City to Gachibowli (approx 5 km)
      const distance = calculateDistance(17.4435, 78.3772, 17.4400, 78.3489);
      expect(distance).toBeGreaterThan(2);
      expect(distance).toBeLessThan(4);
    });

    it('should return 0 for same coordinates', () => {
      const distance = calculateDistance(17.385044, 78.486671, 17.385044, 78.486671);
      expect(distance).toBe(0);
    });

    it('should handle negative coordinates', () => {
      const distance = calculateDistance(-17.385044, -78.486671, -17.385044, -78.486671);
      expect(distance).toBe(0);
    });
  });

  describe('formatDistance', () => {
    it('should format kilometers correctly', () => {
      expect(formatDistance(2.5)).toBe('2.5 km');
      expect(formatDistance(10)).toBe('10.0 km');
      expect(formatDistance(0.5)).toBe('500 m');
    });

    it('should format meters for distances less than 1 km', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.1)).toBe('100 m');
      expect(formatDistance(0.05)).toBe('50 m');
    });

    it('should handle zero distance', () => {
      expect(formatDistance(0)).toBe('0 m');
    });
  });
});

// Example usage demonstration
describe('Real-world example', () => {
  it('should extract coordinates and calculate distance', async () => {
    // Extract coordinates from Maps link
    const mapsUrl = 'https://www.google.com/maps/@17.4435,78.3772,15z';
    const restaurantCoords = await extractCoordinatesFromMapsLink(mapsUrl);
    
    expect(restaurantCoords).not.toBeNull();
    
    if (restaurantCoords) {
      // Validate coordinates
      const isValid = isValidCoordinate(restaurantCoords.lat, restaurantCoords.lng);
      expect(isValid).toBe(true);
      
      // Calculate distance from user location (example: Gachibowli)
      const userLat = 17.4400;
      const userLng = 78.3489;
      
      const distance = calculateDistance(
        userLat,
        userLng,
        restaurantCoords.lat,
        restaurantCoords.lng
      );
      
      // Format for display
      const formattedDistance = formatDistance(distance);
      expect(formattedDistance).toContain('km');
    }
  });
});
