from django import template

register = template.Library()

@register.filter(name='endswith')
def endswith(value, arg):
    """Stringin belirtilen argüman ile bitip bitmediğini kontrol edeceğiz"""
    return str(value).endswith(arg)



@register.filter
def class_name(value):
    return value.__class__.__name__