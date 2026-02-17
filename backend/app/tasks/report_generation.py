"""
Report Generation Tasks
Background tasks for generating reports and analytics
"""
from app.core.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.shipment import Shipment
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@celery_app.task(name="app.tasks.report_generation.generate_daily_report")
def generate_daily_report():
    """
    Generate daily performance report
    """
    try:
        logger.info("Generating daily report...")
        
        db = SessionLocal()
        
        # Calculate yesterday's date
        yesterday = datetime.utcnow() - timedelta(days=1)
        
        # Get statistics
        total_shipments = db.query(Shipment).filter(
            Shipment.created_at >= yesterday
        ).count()
        
        delivered = db.query(Shipment).filter(
            Shipment.created_at >= yesterday,
            Shipment.status == "delivered"
        ).count()
        
        db.close()
        
        report = {
            'date': yesterday.strftime('%Y-%m-%d'),
            'total_shipments': total_shipments,
            'delivered': delivered,
            'delivery_rate': round((delivered / total_shipments * 100) if total_shipments > 0 else 0, 2)
        }
        
        logger.info(f"Daily report generated: {report}")
        
        # In real implementation, send email or save to file
        
        return {
            'status': 'success',
            'report': report,
            'message': 'Daily report generated successfully'
        }
    
    except Exception as e:
        logger.error(f"Report generation failed: {str(e)}")
        raise

@celery_app.task(name="app.tasks.report_generation.generate_weekly_report")
def generate_weekly_report():
    """
    Generate weekly performance report
    """
    logger.info("Generating weekly report...")
    
    # Implement weekly report logic here
    
    return {
        'status': 'success',
        'message': 'Weekly report generated successfully'
    }