from flask_socketio import SocketIO, emit, join_room, leave_room
from flask import request
import os
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SocketService:
    def __init__(self, app, data_manager):
        """Initialize the Socket.IO service.
        
        Args:
            app: Flask application instance
            data_manager: Data manager instance for accessing user data
        """
        # Use a more lightweight configuration for Socket.IO
        # Disable engineio logger to reduce overhead
        # Use async_mode='threading' which is more lightweight than eventlet for small deployments
        self.socketio = SocketIO(
            app, 
            cors_allowed_origins="*", 
            async_mode='threading',
            logger=False, 
            engineio_logger=False,
            ping_timeout=60,
            ping_interval=25,
            max_http_buffer_size=1024 * 1024
        )
        self.data_manager = data_manager
        self.connected_users = {}
        
        # Use a try-except block to handle potential initialization errors
        try:
            self.setup_event_handlers()
            logger.info("Socket.IO service initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing Socket.IO service: {str(e)}")
            # Continue without WebSockets if initialization fails
            # This allows the app to function even if WebSockets are not available
    
    def setup_event_handlers(self):
        """Set up Socket.IO event handlers."""
        
        @self.socketio.on('connect')
        def handle_connect():
            """Handle client connection."""
            try:
                logger.info(f"Client connected: {request.sid}")
                emit('connection_response', {'status': 'connected'})
            except Exception as e:
                logger.error(f"Error in connect handler: {str(e)}")
        
        @self.socketio.on('disconnect')
        def handle_disconnect():
            """Handle client disconnection."""
            try:
                user_id = None
                for uid, sid in self.connected_users.items():
                    if sid == request.sid:
                        user_id = uid
                        break
                
                if user_id:
                    logger.info(f"User {user_id} disconnected")
                    del self.connected_users[user_id]
                    # Notify other users that this user is offline
                    self.socketio.emit('user_offline', {'id': user_id}, broadcast=True)
                else:
                    logger.info(f"Unknown client disconnected: {request.sid}")
            except Exception as e:
                logger.error(f"Error in disconnect handler: {str(e)}")
        
        @self.socketio.on('user_login')
        def handle_user_login(data):
            """Handle user login.
            
            Args:
                data: Dictionary containing user_id
            """
            try:
                user_id = data.get('user_id')
                if not user_id:
                    logger.warning("User login event without user_id")
                    return
                
                logger.info(f"User {user_id} logged in")
                self.connected_users[user_id] = request.sid
                
                # Join user-specific room
                join_room(f"user_{user_id}")
                
                # Notify other users that this user is online
                self.socketio.emit('user_online', {'id': user_id}, broadcast=True)
            except Exception as e:
                logger.error(f"Error in user_login handler: {str(e)}")
        
        @self.socketio.on('routine_update')
        def handle_routine_update(data):
            """Handle routine update.
            
            Args:
                data: Dictionary containing routine data
            """
            try:
                logger.info(f"Routine update received")
                
                # Save the update to the database
                user_id = data.get('user_id', 'default')
                routine = data.get('routine', {})
                
                if routine:
                    self.data_manager.add_routine(routine, user_id)
                
                # Broadcast to all connected clients
                self.socketio.emit('routine_update', data, broadcast=True)
            except Exception as e:
                logger.error(f"Error in routine_update handler: {str(e)}")
        
        @self.socketio.on('caregiver_update')
        def handle_caregiver_update(data):
            """Handle caregiver update.
            
            Args:
                data: Dictionary containing caregiver update data
            """
            try:
                logger.info(f"Caregiver update received")
                
                # Save the update to the database
                user_id = data.get('user_id', 'default')
                update = data.get('update', {})
                
                if update:
                    self.data_manager.add_caregiver_update(update, user_id)
                
                # Broadcast to all connected clients
                self.socketio.emit('caregiver_update', data, broadcast=True)
            except Exception as e:
                logger.error(f"Error in caregiver_update handler: {str(e)}")
        
        @self.socketio.on('join_baby')
        def handle_join_baby(data):
            """Handle joining a baby's room.
            
            Args:
                data: Dictionary containing baby_id
            """
            try:
                baby_id = data.get('baby_id')
                if not baby_id:
                    logger.warning("Join baby event without baby_id")
                    return
                
                logger.info(f"Client {request.sid} joined baby room {baby_id}")
                join_room(f"baby_{baby_id}")
                emit('room_joined', {'room': f"baby_{baby_id}"})
            except Exception as e:
                logger.error(f"Error in join_baby handler: {str(e)}")
        
        @self.socketio.on('leave_baby')
        def handle_leave_baby(data):
            """Handle leaving a baby's room.
            
            Args:
                data: Dictionary containing baby_id
            """
            try:
                baby_id = data.get('baby_id')
                if not baby_id:
                    logger.warning("Leave baby event without baby_id")
                    return
                
                logger.info(f"Client {request.sid} left baby room {baby_id}")
                leave_room(f"baby_{baby_id}")
            except Exception as e:
                logger.error(f"Error in leave_baby handler: {str(e)}")
        
        @self.socketio.on('send_message')
        def handle_send_message(data):
            """Handle sending a message.
            
            Args:
                data: Dictionary containing message data
            """
            try:
                logger.info(f"Message received")
                
                recipient_id = data.get('recipient_id')
                if not recipient_id:
                    logger.warning("Send message event without recipient_id")
                    return
                
                # If recipient is connected, send directly to their room
                if recipient_id in self.connected_users:
                    emit('new_message', data, room=self.connected_users[recipient_id])
                
                # Store message in database for offline delivery
                sender_id = data.get('sender_id', 'unknown')
                message = data.get('message', '')
                timestamp = data.get('timestamp', '')
                
                # In a real implementation, you would store this message
                # self.data_manager.add_message(sender_id, recipient_id, message, timestamp)
            except Exception as e:
                logger.error(f"Error in send_message handler: {str(e)}")
    
    def run(self, host='0.0.0.0', port=8000, debug=False):
        """Run the Socket.IO server.
        
        Args:
            host: Host to bind to
            port: Port to bind to
            debug: Whether to run in debug mode
        """
        try:
            logger.info(f"Starting Socket.IO server on {host}:{port}")
            self.socketio.run(app, host=host, port=port, debug=debug)
        except Exception as e:
            logger.error(f"Error starting Socket.IO server: {str(e)}")
            # Fall back to standard Flask server if Socket.IO fails
            app.run(host=host, port=port, debug=debug)
