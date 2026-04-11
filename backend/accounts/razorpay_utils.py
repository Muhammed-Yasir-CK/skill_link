import razorpay
from django.conf import settings

client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))

def create_order(amount, currency="INR"):
    """
    Creates a Razorpay order.
    Amount should be in the smallest currency unit (e.g., paise for INR).
    """
    # If keys are placeholders, return a mock order for demo purposes
    if settings.RAZORPAY_KEY_ID == "rzp_test_YourTestKeyId":
        import uuid
        import time
        return {
            "id": f"order_mock_{uuid.uuid4().hex[:14]}",
            "entity": "order",
            "amount": int(amount), 
            "amount_paid": 0,
            "amount_due": int(amount),
            "currency": currency,
            "receipt": None,
            "offer_id": None,
            "status": "created",
            "attempts": 0,
            "notes": [],
            "created_at": int(time.time())
        }

    data = {
        "amount": int(amount),  # Already converted to paise in frontend
        "currency": currency,
        "payment_capture": 1  # Auto-capture payment
    }
    order = client.order.create(data=data)
    return order

def verify_payment(order_id, payment_id, signature):
    """
    Verifies the Razorpay payment signature.
    """
    params_dict = {
        'razorpay_order_id': order_id,
        'razorpay_payment_id': payment_id,
        'razorpay_signature': signature
    }
    try:
        client.utility.verify_payment_signature(params_dict)
        return True
    except Exception:
        return False
