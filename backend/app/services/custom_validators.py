"""Custom validators for complex requirements."""

from typing import Callable, Optional

# Registry of custom validators
_validators: dict[str, Callable] = {}


def register_validator(name: str):
    """Decorator to register a custom validator."""

    def decorator(func: Callable):
        _validators[name] = func
        return func

    return decorator


def get_validator(name: str) -> Optional[Callable]:
    """Get a registered validator by name."""
    return _validators.get(name)


# --- Built-in Custom Validators ---


@register_validator("has_path_parameter")
def has_path_parameter(spec: dict, path: str, param_name: str) -> tuple[bool, str]:
    """Check if a path has a specific path parameter defined."""
    paths = spec.get("paths", {})
    path_item = paths.get(path, {})

    # Check path-level parameters
    for param in path_item.get("parameters", []):
        if param.get("name") == param_name and param.get("in") == "path":
            return True, f"Path parameter '{param_name}' found"

    # Check operation-level parameters
    for method in ["get", "post", "put", "delete", "patch", "options", "head"]:
        operation = path_item.get(method, {})
        for param in operation.get("parameters", []):
            if param.get("name") == param_name and param.get("in") == "path":
                return True, f"Path parameter '{param_name}' found in {method.upper()}"

    return False, f"Path parameter '{param_name}' not found in '{path}'"


@register_validator("uses_component_ref")
def uses_component_ref(
    spec: dict, component_type: str, component_name: str
) -> tuple[bool, str]:
    """Check if the spec uses a $ref to a specific component."""
    ref_path = f"#/components/{component_type}/{component_name}"

    def find_ref(obj, path=""):
        if isinstance(obj, dict):
            if obj.get("$ref") == ref_path:
                return True
            for key, value in obj.items():
                if find_ref(value, f"{path}.{key}"):
                    return True
        elif isinstance(obj, list):
            for i, item in enumerate(obj):
                if find_ref(item, f"{path}[{i}]"):
                    return True
        return False

    if find_ref(spec):
        return True, f"Reference to {ref_path} found"
    return False, f"No reference to {ref_path} found"


@register_validator("security_scheme_applied")
def security_scheme_applied(
    spec: dict, scheme_name: str, scope: str = "global"
) -> tuple[bool, str]:
    """Check if a security scheme is applied."""
    if scope == "global":
        security = spec.get("security", [])
        for req in security:
            if scheme_name in req:
                return True, f"Security scheme '{scheme_name}' applied globally"
        return False, f"Security scheme '{scheme_name}' not found in global security"

    # Check specific operation
    for path, path_item in spec.get("paths", {}).items():
        for method, operation in path_item.items():
            if method in ["get", "post", "put", "delete", "patch"]:
                if isinstance(operation, dict):
                    security = operation.get("security", [])
                    for req in security:
                        if scheme_name in req:
                            return (
                                True,
                                f"Security scheme '{scheme_name}' applied to {method.upper()} {path}",
                            )

    return False, f"Security scheme '{scheme_name}' not applied to any operation"


@register_validator("response_has_schema")
def response_has_schema(
    spec: dict,
    path: str,
    method: str,
    status_code: str,
    media_type: str = "application/json",
) -> tuple[bool, str]:
    """Check if a response has a schema defined."""
    try:
        response = spec["paths"][path][method]["responses"][status_code]
        content = response.get("content", {})
        media = content.get(media_type, {})

        if "schema" in media or "$ref" in media:
            return True, f"Schema found for {method.upper()} {path} {status_code}"

        return False, f"No schema for {method.upper()} {path} {status_code} {media_type}"
    except KeyError as e:
        return False, f"Missing path component: {e}"


@register_validator("has_operation_id")
def has_operation_id(spec: dict, path: str, method: str) -> tuple[bool, str]:
    """Check if an operation has an operationId."""
    try:
        operation = spec["paths"][path][method]
        if "operationId" in operation:
            return True, f"operationId found for {method.upper()} {path}"
        return False, f"operationId missing for {method.upper()} {path}"
    except KeyError:
        return False, f"Operation {method.upper()} {path} not found"


@register_validator("has_request_body")
def has_request_body(
    spec: dict, path: str, method: str, media_type: str = "application/json"
) -> tuple[bool, str]:
    """Check if an operation has a request body with specified media type."""
    try:
        operation = spec["paths"][path][method]
        request_body = operation.get("requestBody", {})
        content = request_body.get("content", {})

        if media_type in content:
            return True, f"Request body with {media_type} found for {method.upper()} {path}"
        return False, f"Request body with {media_type} not found for {method.upper()} {path}"
    except KeyError:
        return False, f"Operation {method.upper()} {path} not found"
