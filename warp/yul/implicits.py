IMPLICITS = {
    "memory_dict": "DictAccess*",
    "msize": None,
    "pedersen_ptr": "HashBuiltin*",
    "range_check_ptr": None,
    "storage_ptr": "Storage*",
    "syscall_ptr": "felt*",
    "exec_env": "ExecutionEnvironment",
}

IMPLICITS_SET = set(IMPLICITS.keys())


def print_implicit(name):
    type_ = IMPLICITS.get(name, None)
    if type_ is None:
        return name
    else:
        return f"{name}: {type_}"


def copy_implicit(name):
    return f"local {print_implicit(name)} = {name}"