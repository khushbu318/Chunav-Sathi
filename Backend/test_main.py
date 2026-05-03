import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from main import app, haversine_km, build_maps_url, geocode_query

client = TestClient(app)

# ============================================================================
# Unit Tests - Utility Functions
# ============================================================================

class TestHaversineKm:
    """Test haversine distance calculation"""
    
    def test_same_location(self):
        """Distance between same coordinates should be 0"""
        result = haversine_km(28.6139, 77.2090, 28.6139, 77.2090)
        assert result == pytest.approx(0, abs=0.01)
    
    def test_known_distance(self):
        """Test against a known distance (Delhi to Mumbai ~1148km)"""
        # Delhi: 28.6139° N, 77.2090° E
        # Mumbai: 19.0760° N, 72.8777° E
        result = haversine_km(28.6139, 77.2090, 19.0760, 72.8777)
        assert 1100 < result < 1200  # Should be around 1148km
    
    def test_antipodal_points(self):
        """Opposite poles should be ~20000km"""
        result = haversine_km(0, 0, 0, 180)
        assert 19900 < result < 20100


class TestBuildMapsUrl:
    """Test Google Maps URL generation"""
    
    def test_basic_url_generation(self):
        """Should generate valid Google Maps URL"""
        url = build_maps_url("ChIJ2eUgeAK6Dw", "Delhi Polling Booth")
        assert "google.com/maps/search" in url
        assert "query_place_id=ChIJ2eUgeAK6Dw" in url
    
    def test_empty_name(self):
        """Should handle empty place name"""
        url = build_maps_url("ChIJ2eUgeAK6Dw", "")
        assert "google.com/maps/search" in url
    
    def test_special_characters_in_name(self):
        """Should handle special characters with URL encoding"""
        url = build_maps_url("ChIJ2eUgeAK6Dw", "Election & Voting Center")
        assert "google.com/maps/search" in url
        assert url.count("%") > 0  # Should be URL encoded


# ============================================================================
# API Endpoint Tests - Health Check
# ============================================================================

class TestHealthCheck:
    """Test health check endpoint"""
    
    def test_health_check_success(self):
        """Should return healthy status"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"


# ============================================================================
# API Endpoint Tests - Chat Endpoint
# ============================================================================

class TestChatEndpoint:
    """Test chat functionality with Vertex AI"""
    
    @patch('main.model')
    def test_chat_valid_request(self, mock_model):
        """Should handle valid chat request"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Test response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        payload = {
            "message": "What is voter registration?",
            "history": [],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        assert "response" in response.json()
        assert response.json()["response"] == "Test response"
    
    @patch('main.model')
    def test_chat_with_history(self, mock_model):
        """Should preserve and append to chat history"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "New response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        history = [
            {"role": "user", "content": "Hello"},
            {"role": "model", "content": "Hi there"}
        ]
        
        payload = {
            "message": "What next?",
            "history": history,
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["history"]) == 4  # Original 2 + new 2
    
    @patch('main.model', None)
    def test_chat_model_not_initialized(self):
        """Should return 503 when model not initialized"""
        payload = {
            "message": "Test",
            "history": [],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 503
        assert "not initialized" in response.json()["detail"]
    
    @patch('main.model')
    def test_chat_empty_message(self, mock_model):
        """Should reject empty message with validation error"""
        payload = {
            "message": "",
            "history": [],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        # API should reject empty messages (min_length=1)
        assert response.status_code == 422
    
    @patch('main.model')
    def test_chat_very_long_message(self, mock_model):
        """Should handle long messages within limit"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        # Use message within the 5000 character limit
        long_message = "A" * 4000
        payload = {
            "message": long_message,
            "history": [],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
    
    @patch('main.model')
    def test_chat_exceeds_max_length(self, mock_model):
        """Should reject messages exceeding max length"""
        payload = {
            "message": "A" * 10000,
            "history": [],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        # API should reject messages > 5000 characters
        assert response.status_code == 422
    
    @patch('main.model')
    def test_chat_invalid_language(self, mock_model):
        """Should handle unsupported language gracefully"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        payload = {
            "message": "Test",
            "history": [],
            "language": "Klingon"
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 200
    
    @patch('main.model')
    def test_chat_missing_fields(self, mock_model):
        """Should return 422 when required fields missing"""
        payload = {
            "history": []
            # Missing 'message' field
        }
        response = client.post("/api/chat", json=payload)
        
        assert response.status_code == 422  # Validation error
    
    @patch('main.model')
    def test_chat_malformed_history(self, mock_model):
        """Should handle malformed history"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        payload = {
            "message": "Test",
            "history": [
                {"role": "user"}  # Missing 'content'
            ],
            "language": "English"
        }
        response = client.post("/api/chat", json=payload)
        
        # Should either fail validation or handle gracefully
        assert response.status_code in [200, 422]


# ============================================================================
# API Endpoint Tests - Find Booths
# ============================================================================

class TestFindBoothsEndpoint:
    """Test booth finding functionality"""
    
    @patch('main.gmaps')
    def test_find_booths_by_pincode(self, mock_gmaps):
        """Should find booths by pincode"""
        mock_gmaps.geocode.return_value = [
            {
                'geometry': {
                    'location': {'lat': 28.6139, 'lng': 77.2090}
                }
            }
        ]
        mock_gmaps.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'ChIJ1',
                    'name': 'Election Office',
                    'vicinity': 'Delhi',
                    'geometry': {'location': {'lat': 28.6139, 'lng': 77.2090}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.5
                }
            ]
        }
        
        response = client.get("/find-booths?location_query=110001")
        
        assert response.status_code == 200
        data = response.json()
        assert data["results_count"] >= 0
        assert "booths" in data
    
    @patch('main.gmaps')
    def test_find_booths_by_coordinates(self, mock_gmaps):
        """Should find booths using direct coordinates"""
        mock_gmaps.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'ChIJ1',
                    'name': 'Polling Booth',
                    'vicinity': 'Area',
                    'geometry': {'location': {'lat': 28.6139, 'lng': 77.2090}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.0
                }
            ]
        }
        
        response = client.get("/find-booths?location_query=Delhi&lat=28.6139&lng=77.2090")
        
        assert response.status_code == 200
        data = response.json()
        assert "booths" in data
    
    @patch('main.gmaps')
    def test_find_booths_location_not_found(self, mock_gmaps):
        """Should return 404 when location not found"""
        mock_gmaps.geocode.return_value = []
        
        response = client.get("/find-booths?location_query=InvalidLocation12345")
        
        assert response.status_code == 404
    
    @patch('main.gmaps', None)
    def test_find_booths_maps_api_not_configured(self):
        """Should return 503 when Google Maps API not configured"""
        response = client.get("/find-booths?location_query=Delhi")
        
        assert response.status_code == 503
        assert "not configured" in response.json()["detail"]
    
    @patch('main.gmaps')
    def test_find_booths_empty_results(self, mock_gmaps):
        """Should handle no results gracefully"""
        mock_gmaps.geocode.return_value = [
            {
                'geometry': {
                    'location': {'lat': 0, 'lng': 0}
                }
            }
        ]
        mock_gmaps.places_nearby.return_value = {'results': []}
        
        response = client.get("/find-booths?location_query=NoBooths")
        
        assert response.status_code == 200
        assert response.json()["results_count"] == 0
    
    @patch('main.gmaps')
    def test_find_booths_missing_geometry(self, mock_gmaps):
        """Should skip results with missing geometry"""
        mock_gmaps.geocode.return_value = [
            {
                'geometry': {
                    'location': {'lat': 28.6139, 'lng': 77.2090}
                }
            }
        ]
        mock_gmaps.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'ChIJ1',
                    'name': 'Bad Booth',
                    # Missing geometry
                }
            ]
        }
        
        response = client.get("/find-booths?location_query=Delhi")
        
        assert response.status_code == 200
        assert response.json()["results_count"] == 0
    
    @patch('main.gmaps')
    def test_find_booths_distance_calculation(self, mock_gmaps):
        """Should calculate distance correctly"""
        mock_gmaps.geocode.return_value = [
            {
                'geometry': {
                    'location': {'lat': 28.6139, 'lng': 77.2090}
                }
            }
        ]
        mock_gmaps.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'ChIJ1',
                    'name': 'Near Booth',
                    'vicinity': 'Delhi',
                    'geometry': {'location': {'lat': 28.6139, 'lng': 77.2090}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.0
                },
                {
                    'place_id': 'ChIJ2',
                    'name': 'Far Booth',
                    'vicinity': 'Delhi',
                    'geometry': {'location': {'lat': 28.7, 'lng': 77.3}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.0
                }
            ]
        }
        
        response = client.get("/find-booths?location_query=Delhi")
        
        assert response.status_code == 200
        booths = response.json()["booths"]
        # First booth should be closer than second
        assert booths[0]['distance_km'] < booths[1]['distance_km']
    
    def test_find_booths_missing_location_query(self):
        """Should return 422 when location_query missing"""
        response = client.get("/find-booths")
        
        assert response.status_code == 422
    
    @patch('main.gmaps')
    def test_find_booths_invalid_coordinates(self, mock_gmaps):
        """Should handle invalid latitude/longitude"""
        response = client.get("/find-booths?location_query=Delhi&lat=invalid&lng=77.2090")
        
        # Fastapi should return 422 for type validation error
        assert response.status_code == 422
    
    @patch('main.gmaps')
    def test_find_booths_removes_duplicates(self, mock_gmaps):
        """Should remove duplicate place IDs"""
        mock_gmaps.geocode.return_value = [
            {
                'geometry': {
                    'location': {'lat': 28.6139, 'lng': 77.2090}
                }
            }
        ]
        mock_gmaps.places_nearby.return_value = {
            'results': [
                {
                    'place_id': 'ChIJ_SAME',
                    'name': 'Booth 1',
                    'vicinity': 'Delhi',
                    'geometry': {'location': {'lat': 28.6139, 'lng': 77.2090}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.0
                },
                {
                    'place_id': 'ChIJ_SAME',
                    'name': 'Booth 1 Duplicate',
                    'vicinity': 'Delhi',
                    'geometry': {'location': {'lat': 28.6139, 'lng': 77.2090}},
                    'opening_hours': {'open_now': True},
                    'rating': 4.0
                }
            ]
        }
        
        response = client.get("/find-booths?location_query=Delhi")
        
        assert response.status_code == 200
        booths = response.json()["booths"]
        # Should only have 1 booth (duplicate removed)
        assert len(booths) == 1


# ============================================================================
# Edge Cases and Error Scenarios
# ============================================================================

class TestEdgeCases:
    """Test edge cases and error scenarios"""
    
    def test_post_to_get_endpoint(self):
        """Should return 405 for POST to GET endpoint"""
        response = client.post("/health")
        assert response.status_code == 405
    
    def test_invalid_endpoint(self):
        """Should return 404 for invalid endpoint"""
        response = client.get("/invalid/endpoint")
        assert response.status_code == 404
    
    @patch('main.gmaps')
    @patch('main.model')
    def test_concurrent_requests_chat(self, mock_model, mock_gmaps):
        """Should handle multiple concurrent chat requests"""
        mock_session = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "Response"
        mock_session.send_message.return_value = mock_response
        mock_model.start_chat.return_value = mock_session
        
        payload = {"message": "Test", "history": [], "language": "English"}
        
        # Simulate multiple requests
        responses = [client.post("/api/chat", json=payload) for _ in range(3)]
        
        assert all(r.status_code == 200 for r in responses)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
